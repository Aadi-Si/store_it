import toast, { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import { Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ResetPassword from "./pages/ResetPassword";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchUser } from "./store/features/authSlice";

const App = () => {
  const dispatch = useDispatch()
  const {isLoggedIn} = useSelector((state)=>state.auth)
  useEffect(()=>{
    dispatch(fetchUser())
  },[dispatch])
  return (
    <>
      <Toaster />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={isLoggedIn ?<Navigate to="/home" replace /> :<Login />} />
          <Route path="/reset-password" element={isLoggedIn ?<Navigate to="/home" replace /> :<ResetPassword/>}/>
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Route>
        <Route path="/home" element={isLoggedIn ? <Home/> : <Navigate to="/login" replace/>}/>
      </Routes>
    </>
  );
};

export default App;
