import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
function App() {
  const handleSuccess = (res) => {
    axios.post("http://localhost:3000/auth/signup/google", {
      credential: res.credential,
    });
  };
  const handleError = () => {
    console.log("Login failed");
  };
  return (
    <div className="w-screen h-screen flex justify-center items-center flex-col gap-5">
      <h1 className="font-extrabold text-white text-2xl tracking-widest">
        Login
      </h1>
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
}

export default App;
