'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';
import {auth} from '@/lib/firebase';
import {useToast} from '@/hooks/use-toast';

export default function SignupPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const {toast} = useToast();

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Signup Successful',
        description: 'Your account has been created.',
      });
      router.push('/'); // Redirect to home page after signup
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message,
      });
      console.error('Signup failed:', error);
    }
  };

  const handleOAuthSignup = async (provider: string) => {
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
        title: 'Signup Successful',
        description: `You have successfully signed up with ${provider}.`,
      });
      router.push('/'); // Redirect to home page after signup
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'OAuth Signup Failed',
        description: error.message,
      });
      console.error(`OAuth signup with ${provider} failed:`, error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-background">
      <Card className="w-96">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
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
          <Button onClick={handleSignup}>Sign Up</Button>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => handleOAuthSignup('google')}>
              Signup with Google
            </Button>
            <Button variant="outline" onClick={() => handleOAuthSignup('facebook')}>
              Signup with Facebook
            </Button>
            <Button variant="outline" onClick={() => handleOAuthSignup('github')}>
              Signup with GitHub
            </Button>
          </div>
          <div className="text-center">
            <Button variant="link" onClick={() => router.push('/login')}>
              Already have an account? Log In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'