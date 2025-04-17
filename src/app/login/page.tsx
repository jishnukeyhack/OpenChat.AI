'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {useRouter} from 'next/navigation';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

const FormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleLogin = async (data: z.infer<typeof FormSchema>) => {
    try{
      await signInWithEmailAndPassword(auth!, data.email, data.password);
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
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'Firebase Authentication is not properly initialized.',
      });
      return;
    }
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

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
        await signInWithEmailAndPassword(auth!, data.email, data.password);
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


  return (
    <div className="flex justify-center items-center h-screen bg-background">
      <div className="w-full max-w-md">
        <div className="flex justify-between mb-6">
          <Button onClick={() => router.push('/login')}>Log In</Button>
          <Button onClick={() => router.push('/signup')}>Sign Up</Button>
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Form {...form} >
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Password" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit">Log In</Button>
              </form>
            </Form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="flex w-full justify-center gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => handleOAuthLogin('google')}
                className="w-full"
              >
                Google
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => handleOAuthLogin('facebook')}
                className="w-full"
              >
                Facebook
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => handleOAuthLogin('github')}
                className="w-full"
              >
                Github
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



