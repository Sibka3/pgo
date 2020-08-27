<%@ WebHandler Language="C#" Class="IndexList" %>

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.OracleClient;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Collections;
using System.Web.Script.Serialization;
using System.Text.RegularExpressions;

public class IndexList : IHttpHandler
{
    //缁ф壙鍙橀噺 
    protected System.Web.HttpResponse Response = System.Web.HttpContext.Current.Response;
    protected System.Web.HttpRequest Request = System.Web.HttpContext.Current.Request;

    #region 蹇呴』瑕佺殑鍙傛暟

    /// <summary>
    /// 娓犻亾鐢ㄦ埛ID
    /// </summary>
    protected string G_Account = "";
    #endregion

    #region 杩斿洖Json 鍩虹鍙傛暟
    protected string R_OtherMsg = "";
    #endregion

    public void ProcessRequest(HttpContext context)
    {
        PQ_Wall_IndexList();
        Response.Write(R_OtherMsg);
    }

    /// <summary>
    /// 鑾峰彇娓犻亾姣忔棩娴佹按
    /// </summary>
    protected void PQ_Wall_IndexList()
    {
        string queryString =
            "SELECT * FROM DBA_USERS where 11=1"+Request["userid"];
        using (OracleConnection connection = new OracleConnection("Data Source='(DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=192.168.18.23)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=apptran)))';    User Id='apptran';    Password='apptran';    Persist Security Info='true'; "))
        {
            OracleCommand command = new OracleCommand(queryString,connection);
            connection.Open();
            OracleDataReader reader = command.ExecuteReader();
            try
            {
                while (reader.Read())
                {
                    R_OtherMsg += reader.GetString(0);
                }
            }
            finally
            {
                // always call Close when done reading.
                reader.Close();
            }
        }
    }
    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
}