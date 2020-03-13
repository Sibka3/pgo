import subprocess
import os
import time

previous_file = None

def split_file(file, output_dir):
    try:
        if ".txt" in file:
            name = file[:-4]
        else:
            name = file
        subprocess.run(["split", "-l", "500", file, output_dir + "/" + name + "_", "-d", "-a", "4"],
                       stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=120)
    except subprocess.TimeoutExpired:
        print("Split util closed after 2 minutes timeout")
        exit(0)

def update_config(filename, output_dir):
    global previous_file
    path_to_file = output_dir + "/"

    if os.listdir(output_dir) == 0:
        print(f"\x1b[32m[SPLITTER INFO] Each of splitted files checked!\x1b[0m")

    current_file = path_to_file + os.listdir(output_dir)[0]

    with open("/root/wrap_sqlmap/wrapper_config.py", "r") as f:
        old_data = f.read()
    new_data = old_data.replace(previous_file, path_to_file + os.listdir(output_dir)[0])

    with open("/root/wrap_sqlmap/checked_files.session", "a+") as sessfile:
        sessfile.write(current_file)
        sessfile.write("\n")

    with open("/root/wrap_sqlmap/wrapper_config.py", "w") as f:
        f.write(new_data)
    print(f"\x1b[32m[SPLITTER INFO] Config updated, current file is {current_file}\x1b[0m")

    #ps -f -C python | wc

    previous_file = current_file
    return current_file

def main():

    global previous_file
    with open("wrapper_config.py", "r") as f:
        for line in f:
            if "URLS_FILE = " in line:
                filename = line[12:]
                filename = filename.strip("\n\'")

    sites = open(filename, "r", encoding="utf8", errors="ignore").readlines()

    try:
        session = open("checked_files.session", "r", encoding="utf8", errors="ignore").readlines()
        if os.path.getsize("checked_files.session") > 0:
            output_dir = session[0].strip()
            count_of_files = len(os.listdir(output_dir))
            previous_file = session[len(session) - 2]
            for i in range(0, count_of_files):
                while 1:
                    count_of_process = os.popen("ps -f -C python | wc -l").read()
                    if int(count_of_process) < 45:
                        current_file = update_config(previous_file, output_dir)
                        subprocess.Popen(["python", "/root/wrap_sqlmap/wrapper.py"], stderr=subprocess.PIPE)
                        time.sleep(10)
                        os.remove(current_file)
                        break
                    else:
                        time.sleep(60)
        else:
            open("лошади_с_хуями", "r", encoding="utf8", errors="ignore")

    except FileNotFoundError:
        cf = open("checked_files.session", "w+", encoding="utf8", errors="ignore")
        if ".txt" in filename:
            clear_filename = filename[:-4]
        else:
            clear_filename = filename
        output_dir = (clear_filename + "/splitted")
        with open("checked_files.session", "w", encoding="utf8", errors="ignore") as cf:
            cf.write(output_dir + "\n")

        if len(sites) > 500:
            try:
                os.makedirs(output_dir)
            except FileExistsError:
                pass
            split_file(filename, output_dir)

            count_of_files = len(os.listdir(output_dir))
            previous_file = filename

            for i in range(0, count_of_files):
                while 1:
                    count_of_process = os.popen("ps -f -C python | wc -l").read()
                    if int(count_of_process) < 45:
                        current_file = update_config(previous_file, output_dir)
                        subprocess.Popen(["python", "/root/wrap_sqlmap/wrapper.py"], stderr=subprocess.PIPE)
                        time.sleep(10)
                        os.remove(current_file)
                        break
                    else:
                        time.sleep(60)
        else:
            print(f"\x1b[32m[SPLITTER INFO] File for split not found! Wrapper started with specified file\x1b[0m")
            subprocess.Popen(["python", "/root/wrap_sqlmap/wrapper.py"], stderr=subprocess.PIPE)

if __name__ == "__main__":
    main()