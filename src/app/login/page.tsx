'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';
import {auth} from '@/lib/firebase';
import {useToast} from '@/hooks/use-toast';

export default function LoginPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const {toast} = useToast();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Login Successful',
        description: 'You have successfully logged in.',
      });
      router.push('/'); // Redirect to home page after login
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
      console.error('Login failed:', error);
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    let oAuthProvider;
    switch (provider) {
      case 'google':
        oAuthProvider = new GoogleAuthProvider();
        break;
      case 'facebook':
        oAuthProvider = new FacebookAuthProvider();
        break;
      case 'github':
        oAuthProvider = new GithubAuthProvider();
        break;
      default:
        toast({
          variant: 'destructive',
          title: 'OAuth Error',
          description: 'Invalid provider.',
        });
        return;
    }

    try {
      await signInWithPopup(auth, oAuthProvider);
      toast({
        title: 'Login Successful',
        description: `You have successfully logged in with ${provider}.`,
      });
      router.push('/'); // Redirect to home page after login
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'OAuth Login Failed',
        description: error.message,
      });
      console.error(`OAuth login with ${provider} failed:`, error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-background">
      <Card className="w-96">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleLogin}>Log In</Button>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => handleOAuthLogin('google')}>
              Login with Google
            </Button>
            <Button variant="outline" onClick={() => handleOAuthLogin('facebook')}>
              Login with Facebook
            </Button>
            <Button variant="outline" onClick={() => handleOAuthLogin('github')}>
              Login with GitHub
            </Button>
          </div>
          <div className="text-center">
            <Button variant="link" onClick={() => router.push('/signup')}>
              Don't have an account? Sign Up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
