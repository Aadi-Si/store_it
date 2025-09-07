import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Loader = ({ type = "login" }) => {

  const animations = {
    login: "/assets/animations/Login.lottie",
    upload: "/assets/animations/uploading.lottie",
    reset: "/assets/animations/resetPassword.lottie",
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-white md:p-40 md:px-60">
      <DotLottieReact
        src={animations[type]}
        loop
        autoplay
        style={{ width:"100%",height:"100%", objectFit: "contain" }}
      />
    </div>
  );
};

export default Loader;
