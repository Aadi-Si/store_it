import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthStatus, resetNewPassword, resetPassword, setOtp,setEmail} from "../store/features/authSlice";
const ResetPassword = () => {
  const navigate = useNavigate()
  const {status,error,isEmailSent,otp,email} = useSelector((state)=>state.auth)
  const dispatch = useDispatch()
  // const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  // const [isEmailSent, setIsEmailSent] = useState("");
  // const [otp, setOtp] = useState(0);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
    const inputRefs = React.useRef([]);
    const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };
  const onSubmitEmail = async(e)=>{
    e.preventDefault()
    if(status === "loading"){
      return;
    }
    await dispatch(resetPassword({email})).unwrap()
    dispatch(setEmail(email))
  }
  
  const onSubmitOTP = (e)=>{
    e.preventDefault()
    if(status === "loading"){
      return;
    }
    const otpArray = inputRefs.current.map((e)=>e.value).join("")
    dispatch(setOtp(otpArray))
    setIsOtpSubmitted(true)
  }

  const onSubmitPassword = async(e)=>{
    e.preventDefault()
    if(status === "loading"){
      return
    }
    try {
      await dispatch(resetNewPassword({email,otp,newPassword})).unwrap()
      navigate("/login");
    } catch (error) {
      setIsOtpSubmitted(false)
    }
  }

  useEffect(() => {
  if (error) {
    toast.error(error);
    dispatch(clearAuthStatus());
  }
}, [error,dispatch, navigate]);

  return (
    <>
    {status === "loading" && <Loader type="reset"/>}
    <div className=" md:w-2/3 md:flex items-center justify-center">
          <img
            src="/assets/icons/logo-full-brand.svg"
            width = {224}
            height = {82}
            className ="mt-20 mb-10 ml-15 md:hidden"
          />
      <div className="md:w-[40%] p-5 px-10 border-2 border-white shadow-2xl rounded-2xl">
        {!isEmailSent && (
          <form onSubmit={onSubmitEmail}>
            <h1 className="h1 text-center mb-6">Reset password</h1>
            <h4 className="h4 text-center mb-6">
              Enter your registered email address.
            </h4>
            <div className="mb-5 p-3 border-2 border-white shadow-2xl rounded-2xl">
              <h4>Email</h4>
              <input
                onChange={(event) => dispatch(setEmail(event.target.value))}
                className="outline-none w-full"
                type="email"
                value={email}
                placeholder="Enter your email"
              />
            </div>
            <button
              className="bg-brand-100 text-white p-2 rounded-full h5 w-full cursor-pointer transition duration-150 ease-in-out 
             active:scale-95 active:shadow-inner mb-5"
            >
              submit
            </button>
          </form>
        )}
        {isEmailSent && !isOtpSubmitted && (
          <form onSubmit={onSubmitOTP}>
            <h1 className="h1 text-center mb-6">Reset password OTP</h1>
            <h4 className="h4 text-center mb-6">
              Enter the 6-digit code sent to your email id.
            </h4>
            <div className="flex justify-between mb-8">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <input
                    type="text"
                    maxLength="1"
                    key={index}
                    required
                    className="w-12 h-12 bg-brand text-white text-center text-xl rounded-md font-bold outline-none"
                    ref={(e) => (inputRefs.current[index] = e)}
                    onInput={(e) => handleInput(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={(e) => {
                      handlePaste(e, index);
                    }}
                  />
                ))}
            </div>
            <button
              className="bg-brand-100 text-white p-2 rounded-full h5 w-full cursor-pointer transition duration-150 ease-in-out 
             active:scale-95 active:shadow-inner mb-5"
            >
              Submit
            </button>
          </form>
        )}
        {isOtpSubmitted && (
          <form onSubmit={onSubmitPassword}>
            <h1 className="h1 text-center mb-6">New password</h1>
            <h4 className="h4 text-center mb-6">
              Enter the new password below
            </h4>
            <div className="mb-5 p-3 border-2 border-white shadow-2xl rounded-2xl">
              <h4>Password</h4>
              <input
                onChange={(event) => setNewPassword(event.target.value)}
                className="outline-none w-full"
                type="password"
                value={newPassword}
                placeholder="Enter your password"
              />
            </div>
            <button
              className="bg-brand-100 text-white p-2 rounded-full h5 w-full cursor-pointer transition duration-150 ease-in-out 
             active:scale-95 active:shadow-inner mb-5"
            >
              submit
            </button>
          </form>
        )}
      </div>
    </div>
    </>
  );
};

export default ResetPassword;
