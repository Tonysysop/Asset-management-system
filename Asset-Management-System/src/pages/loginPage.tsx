import LoginForm from "@/components/LoginForm";
import loginBg from "@/assets/login-bg.jpg";

const Index = () => {
  return (
    <div 
      className="min-h-screen bg-gradient-background-warm flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'soft-light',
      }}
    >
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
};

export default Index;
