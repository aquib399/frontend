import GithubLogin from "@/components/login/github";
import GoogleLogin from "@/components/login/google";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome back! Please sign in to continue.
          </p>
        </div>
        <div className="flex w-full gap-5">
          <GoogleLogin />
          <GithubLogin />
        </div>
      </div>
    </div>
  );
}
