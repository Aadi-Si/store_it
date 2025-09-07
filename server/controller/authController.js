const userModel = require('./../model/userModel')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const  transporter = require('./../config/nodemailer');
const {EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE} = require('./../config/emailTemplates')

const register = async (req,res)=>{
    const {name,email,password} = req.body;
    if(!name||!email||!password){
        return res.status(400).json({success:false,message:"Missing Details"})
    }
    try {
        const existingUser = await userModel.findOne({email})
        if(existingUser){
            return res.status(409).json({success:false,message:"User already exists"})
        }
        const hashedPassword = await bcrypt.hash(password,10) 
        const user = new userModel({
            name,email,password:hashedPassword
        })
        await user.save()

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"})

        res.cookie("token",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge:7*24*60*60*1000
        })
        const mailOptions = {
            from:process.env.GMAIL_USER,
            to:email,
            subject:"Welcome To StoreIt",
            text:`Welcome to StoreIt. Your account has been created with email id:${email}`
        }
        await transporter.sendMail(mailOptions)
        return res.status(201).json({ success: true, message: "User registered successfully" })


    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Send verification OTP to user's email
const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId);

    if (user.isAccountVerified) {
      return res.status(400).json({
        success: false,
        message: "Account already verified",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: "Account Verification OTP",
      html: EMAIL_VERIFY_TEMPLATE
        .replace("{{otp}}", otp)
        .replace("{{email}}", user.email), // fixed missing curly brace
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Verification OTP sent to email",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify the email using the OTP
const verifyEmail = async (req, res) => {
  const userId = req.user.id;
  const { otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({
      success: false,
      message: "Missing details",
    });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.verifyOtp ==='' || user.verifyOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Send password reset OTP
const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 7 * 60 * 1000; // 15 minutes
    await user.save();

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: "Password Reset OTP",
      html: PASSWORD_RESET_TEMPLATE
        .replace("{{otp}}", otp)
        .replace("{{email}}", user.email), // fixed missing curly brace
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reset User Password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email, OTP, and new password are required",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  register,
  login,
  logout,
  sendVerifyOtp,
  verifyEmail,
  sendResetOtp,
  resetPassword
};