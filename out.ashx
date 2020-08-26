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
    //继承变量 
    protected System.Web.HttpResponse Response = System.Web.HttpContext.Current.Response;
    protected System.Web.HttpRequest Request = System.Web.HttpContext.Current.Request;

    #region 必须要的参数

    /// <summary>
    /// 渠道用户ID
    /// </summary>
    protected string G_Account = "";

    /// <summary>
    /// 开始时间
    /// </summary>
    protected string G_StartDate = "";

    /// <summary>
    /// 结束时间
    /// </summary>
    protected string G_EndDate = "";

    /// <summary>
    /// 当前页码
    /// </summary>
    protected int G_PageNo = 1;
    #endregion

    #region 返回Json 基础参数
    /// <summary>
    /// 返回状态 0 正常 其他不正常
    /// </summary>
    protected int R_Status = 1;

    /// <summary>
    /// 返回数据条数
    /// </summary>
    protected int R_Count = 0;

    /// <summary>
    /// 分页总页数
    /// </summary>
    protected int R_TotalPage = 0;

    /// <summary>
    /// 返回其他信息 
    /// </summary>
    protected string R_OtherMsg = "";

    /// <summary>
    /// 返回信息
    /// </summary>
    protected string R_Msg = "";

    /// <summary>
    /// 返回json 信息
    /// </summary>
    protected string R_JsonMsg = "";

    #endregion

    public void ProcessRequest(HttpContext context)
    {
        //获取请求参数
        if (CheckParams())
        {
            PQ_Wall_IndexList();
        }
        else
        {
            R_Status = -1;
            R_Msg = "校验不正确!";
        }
        R_JsonMsg = BackJson(R_Status, R_OtherMsg, R_Msg);
        Response.Write(R_JsonMsg);
    }

    /// <summary>
    /// 获取渠道每日流水
    /// </summary>
    protected void PQ_Wall_IndexList()
    {
        Utility.Oracle oracle = new Utility.Oracle();
        DataSet ds = null;
        OracleParameter I_ACCOUNT, I_BEGINDATE, I_ENDDATE, I_PAGESIZE, I_PAGENO, O_TOTALMONEY, O_OUTRECORDCOUNT, O_OUTCURSOR, O_RESULT, O_MESSAGE;
        OracleParameter[] Parameters;
        I_ACCOUNT = new OracleParameter("I_ACCOUNT", G_Account);
        I_BEGINDATE = new OracleParameter("I_BEGINDATE", G_StartDate);
        I_ENDDATE = new OracleParameter("I_ENDDATE", G_EndDate);
        I_PAGESIZE = new OracleParameter("I_PAGESIZE", 30);
        I_PAGENO = new OracleParameter("I_PAGENO", G_PageNo);
        O_TOTALMONEY = new OracleParameter("O_TOTALMONEY", OracleType.VarChar, 1000);
        O_TOTALMONEY.Direction = ParameterDirection.Output;
        O_OUTRECORDCOUNT = new OracleParameter("O_OUTRECORDCOUNT", OracleType.Number);
        O_OUTRECORDCOUNT.Direction = ParameterDirection.Output;
        O_OUTCURSOR = new OracleParameter("O_OUTCURSOR", OracleType.Cursor);
        O_OUTCURSOR.Direction = ParameterDirection.Output;
        O_RESULT = new OracleParameter("O_RESULT", OracleType.Number);
        O_RESULT.Direction = ParameterDirection.Output;
        O_MESSAGE = new OracleParameter("O_MESSAGE", OracleType.VarChar, 1000);
        O_MESSAGE.Direction = ParameterDirection.Output;
        Parameters = new OracleParameter[] { I_ACCOUNT, I_BEGINDATE, I_ENDDATE, I_PAGESIZE, I_PAGENO, O_TOTALMONEY, O_OUTRECORDCOUNT, O_OUTCURSOR, O_RESULT, O_MESSAGE };
        try
        {
            ds = oracle.ExecuteDataSetAD("P_WALL_MANAGE1.PQ_Wall_FluxList", Parameters);
            R_Status = Convert.ToInt32(O_RESULT.Value);
            R_Msg = Convert.ToString(O_MESSAGE.Value);
            R_Count = Convert.ToInt32(O_OUTRECORDCOUNT.Value);
            R_TotalPage = Convert.ToInt32(R_Count / 30) + ((R_Count % 30) > 0 ? 1 : 0);
            string totalmoney = O_TOTALMONEY.Value.ToString();
            if (Convert.ToInt32(O_RESULT.Value) == 0 & ds != null)
            {
                R_OtherMsg += ConvertDataTableToJson("items", ds.Tables[0]);
                R_OtherMsg += ",";
                StringBuilder str = new StringBuilder();
                str.AppendFormat("\"" + "total" + "\":{0}", R_Count);
                str.AppendFormat("," + "\"" + "pageno" + "\":{0}", G_PageNo);
                str.AppendFormat("," + "\"" + "totalpage" + "\":{0}", R_TotalPage);
                str.AppendFormat("," + "\"" + "totalmoney" + "\":{0}", totalmoney);
                R_OtherMsg += str;
            }
        }
        catch (Exception ex)
        {
            R_Status = -9;
            R_Msg = ex;
        }


    }

    /// <summary>
    /// 传入参数校验
    /// </summary>
    protected bool CheckParams()
    {
        try
        {
            //渠道用户ID（需唯一）
            if (string.IsNullOrEmpty(Request["account"]))
            {
                R_Status = 1;
                R_Msg = "您的操作有误，请刷新后重试！";
                return false;
            }
            G_Account = Request["account"];

            if (!string.IsNullOrEmpty(Request["pageno"]))
            {
                G_PageNo = Convert.ToInt32(Request["pageno"]);
            }
            else
            {
                G_PageNo = 1;
            }
            if (!string.IsNullOrEmpty(Request["startdate"]))
            {
                G_StartDate = Request["startdate"];
            }
            else
            {
                G_StartDate = "";
            }
            if (!string.IsNullOrEmpty(Request["enddate"]))
            {
                G_EndDate = Request["enddate"];
            }
            else
            {
                G_EndDate = "";
            }
        }
        catch (Exception ex)
        {
            return false;
        }
        return true;
    }

    #region 返回Jsion信息
    /// <summary>
    /// 返回Jsion信息
    /// </summary>
    /// <param name="status">状态</param>
    /// <param name="OtherMsg">其他信息,如不为空需自行组成jsion</param>
    /// <param name="msg">提示信息</param>
    /// <returns></returns>
    public static string BackJson(int status, string OtherMsg, string msg)
    {
        //msg = HttpUtility.UrlEncode(msg);
        //msg = msg.Replace("+", "%20");
        string jsonmsg = "{";
        jsonmsg += "\"status\"" + ":" + status.ToString() + ",";
        if (!string.IsNullOrEmpty(OtherMsg))
        {
            if (OtherMsg.Substring(0, 1) == "{")
            {
                jsonmsg += "\"data\"" + ":" + OtherMsg + ",";
            }
            else
            {
                jsonmsg += "\"data\"" + ":{" + OtherMsg + "},";
            }

        }
        else
        {
            jsonmsg += "\"data\"" + ":{},";
        }
        jsonmsg = jsonmsg + "\"msg\"" + ":" + "\"" + msg + "\"";
        jsonmsg = jsonmsg + "}";
        return jsonmsg;
    }
    #endregion

    #region 将DataTable拼装转换成json
    /// <summary>
    /// 将DataTable转换成json   
    /// </summary>
    /// <param name="ItemsName">数组名称</param>
    /// <param name="dt">DataTable 表</param>
    /// <returns></returns>
    public string ConvertDataTableToJson(string ItemsName, DataTable dt)
    {

        System.Text.StringBuilder jsonBuilder = new System.Text.StringBuilder();
        int count = dt.Rows.Count;
        string note = "";
        if (count != 0)
        {
            //jsonBuilder.Append("{\"");
            //jsonBuilder.Append(dt.TableName);
            //jsonBuilder.Append("[");
            if (!string.IsNullOrEmpty(ItemsName))
            {
                jsonBuilder.Append("\"" + ItemsName + "\":[");
            }
            for (int i = 0; i < dt.Rows.Count; i++)
            {
                jsonBuilder.Append("{");
                for (int j = 0; j < dt.Columns.Count; j++)
                {
                    jsonBuilder.Append("");
                    jsonBuilder.Append("\"" + dt.Columns[j].ColumnName.ToLower() + "\"");
                    //note = HttpUtility.UrlEncode(dt.Rows[i][j].ToString());
                    //note = note.Replace("+", "%20");
                    note = dt.Rows[i][j].ToString();
                    if (dt.Columns[j].DataType == typeof(string))
                    {
                        note = ReplaceSymbol(note);
                        jsonBuilder.Append(":\"" + note + "\",");
                    }
                    else
                    {
                        jsonBuilder.Append(":" + note + ",");
                    }
                }
                jsonBuilder.Remove(jsonBuilder.Length - 1, 1);
                jsonBuilder.Append("},");
            }
            jsonBuilder.Remove(jsonBuilder.Length - 1, 1);
            if (!string.IsNullOrEmpty(ItemsName))
            {
                jsonBuilder.Append("]");
            }
            //jsonBuilder.Append("]");
            //jsonBuilder.Append("}");
            return jsonBuilder.ToString();
        }
        else
        {
            if (!string.IsNullOrEmpty(ItemsName))
            {
                jsonBuilder.Append("\"" + ItemsName + "\":[]");
                return jsonBuilder.ToString();
            }
            return null;
        }
    }
    #endregion
    #region 特殊符号替换成转义符
    /// <summary> 
    ///  特殊符号替换成转义符
    /// </summary> 
    /// <param name="sPassed">需要替换的字符串</param> 
    /// <returns></returns> 
    public static string ReplaceSymbol(string sContent)
    {

        if (sContent == null) { return sContent; }

        if (sContent.Contains("\\"))
        {
            sContent = sContent.Replace("\\", "\\\\");
        }

        if (sContent.Contains("\'"))
        {
            sContent = sContent.Replace("\'", "\\\'");
        }

        if (sContent.Contains("\""))
        {
            sContent = sContent.Replace("\"", "\\\"");
        }

        //去掉字符串的回车换行符 
        sContent = Regex.Replace(sContent, @"[\n\r]", "");
        sContent = sContent.Trim();
        return sContent;
    }
    #endregion

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
}
