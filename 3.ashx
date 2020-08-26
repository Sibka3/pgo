<%@ WebHandler Language="C#" Class="Card_OpenCard" %>

using System;
using System.Web;
using MainBase.BaseFunciont;
using MainBase.APPFunciont;
using System.Data.OracleClient;
using System.Data;
using System.Collections;

public class Card_OpenCard : APPBase.APPBase
{

    #region 返回Json 基础参数
    /// <summary>
    /// 翻牌次数
    /// </summary>
    protected string opennum ="";
    protected string test_var = "";
    /// <summary>
    /// 返回状态 0 正常 其他不正常
    /// </summary>
    protected int R_Status = 1;
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
    protected override void DoMain()
    {
        Userid = int.Parse(Request["userid"].ToString());
        test_var = Request["userid"].ToString();
        PW_OPENCARD();

        R_JsonMsg = basefunciont.BackJson(R_Status, R_OtherMsg, R_Msg);
        Response.Write(R_JsonMsg);
    }

    protected void PW_OPENCARD()
    {
        try
        {
            opennum = Request["opennum"].ToString();
        }
        catch
        {
            R_Status = 101;
            R_Msg = "1";
            return;
        }
        Utility.Oracle oracle = new Utility.Oracle();
        DataSet ds = null;
        OracleParameter I_USERID, I_OPENNUM, O_OUTCURSOR, O_OUTCURSORSUM, O_RESULT, O_MESSAGE;
        OracleParameter[] Parameters;
        I_USERID = new OracleParameter("I_USERID", test_var);
        I_OPENNUM = new OracleParameter("I_OPENNUM", opennum);
        O_OUTCURSOR = new OracleParameter("O_OUTCURSOR", OracleType.Cursor);
        O_OUTCURSOR.Direction = ParameterDirection.Output;
        O_OUTCURSORSUM = new OracleParameter("O_OUTCURSORSUM", OracleType.Cursor);
        O_OUTCURSORSUM.Direction = ParameterDirection.Output;
        O_RESULT = new OracleParameter("O_RESULT", OracleType.Number);
        O_RESULT.Direction = ParameterDirection.Output;
        O_MESSAGE = new OracleParameter("O_MESSAGE", OracleType.VarChar, 500);
        O_MESSAGE.Direction = ParameterDirection.Output;
        Parameters = new OracleParameter[] { I_USERID, I_OPENNUM, O_OUTCURSOR, O_OUTCURSORSUM, O_RESULT, O_MESSAGE };
        try
        {
            ds = oracle.ExecuteDataSetAD("P_SA_CARDINFO.PW_OPENCARD", Parameters);
            R_Status = Convert.ToInt32(O_RESULT.Value);
            R_Msg = Convert.ToString(O_MESSAGE.Value);

            if (R_Status == 0 && ds.Tables[0].Rows.Count > 0)
            {
                R_OtherMsg += basefunciont.ConvertDataTableToJson("opencard", ds.Tables[0]);
                R_OtherMsg += "," + basefunciont.ConvertDataTableToJson("opencardsum", ds.Tables[1]);
            }
        }
        catch
        {
        }
    }

}
