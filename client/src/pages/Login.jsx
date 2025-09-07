import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  registerUser,
  loginUser,
  fetchUser,
  clearAuthStatus,
} from "../store/features/authSlice";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";
const Login = () => {
  const navigate = useNavigate()
  const [sign, setSign] = useState("Sign In");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (status === "loading") {
      return;
    }
    if (sign === "Sign Up") {
      await dispatch(registerUser({ name, email, password })).unwrap();
      setName("");
      setEmail("");
      setPassword("");
      setSign("Sign In");
    } else {
      const loginResult = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(loginResult)) {
        await dispatch(fetchUser()).unwrap();
        navigate("/home")
      }
      setEmail("");
      setPassword("");
    }
  };
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthStatus());
    }
  }, [error, dispatch]);

  return (
    <>
      {status === "loading" && <Loader type="login"/>}
      <div className="w-full md:w-2/3 md:flex items-center justify-center">
      <img
            src="/assets/icons/logo-full-brand.svg"
            width = {224}
            height = {82}
            className ="mt-10 mb-2 ml-15 md:hidden"
          />
        <div className="md:w-[40%] p-5 px-10 border-2 border-white shadow-2xl rounded-2xl">
          <h1 className="h1 text-center mb-5">
            {sign === "Sign Up" ? "Sign Up" : "Sign In"}
          </h1>
          <h4 className="h4 text-center mb-6">
            {sign === "Sign Up"
              ? "Create your account"
              : "Log into your account"}
          </h4>
          <form onSubmit={onSubmitHandler}>
            {sign === "Sign Up" && (
              <div className="mb-5 p-3 border-2 border-white shadow-2xl rounded-2xl">
                <h4>Name</h4>
                <input
                  className="outline-none w-full pt-2"
                  type="text"
                  onChange={(event) => setName(event.target.value)}
                  value={name}
                  placeholder="Enter your name"
                />
              </div>
            )}
            <div className="mb-5 p-3 border-2 border-white shadow-2xl rounded-2xl">
              <h4>Email</h4>
              <input
                onChange={(event) => setEmail(event.target.value)}
                className="outline-none w-full"
                type="email"
                value={email}
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-5 p-3 border-2 border-white shadow-2xl rounded-2xl">
              <h4>Password</h4>
              <input
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
                className="outline-none w-full"
                type="password"
                value={password}
                placeholder="Enter your password"
              />
            </div>
            <p onClick={()=>navigate("/reset-password")} className="mb-5 text-gray-600 cursor-pointer">
              Forgot your password ?
            </p>

            <button
              className="bg-brand-100 text-white p-2 rounded-full h5 w-full cursor-pointer transition duration-150 ease-in-out 
             active:scale-95 active:shadow-inner mb-5"
            >
              {sign}
            </button>
          </form>
          {sign === "Sign Up" ? (
            <p className="text-center">
              Already have an account ?&nbsp;
              <span
                onClick={() => setSign("Sign In")}
                className="text-brand-100 cursor-pointer"
              >
                Login
              </span>
            </p>
          ) : (
            <p className="text-center">
              Don't have an account ?&nbsp;
              <span
                onClick={() => setSign("Sign Up")}
                className="text-brand-100 cursor-pointer"
              >
                Register
              </span>
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;
