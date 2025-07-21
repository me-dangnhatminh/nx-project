'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@shadcn-ui/components/button';
import { Input } from '@shadcn-ui/components/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@shadcn-ui/components/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@shadcn-ui/components/form';
// import { SignInSchema, type SignInFormData } from '@shared/types/pmms';
import { useMutation } from '@tanstack/react-query';
import { authApi } from 'apps/pm-ms-ui/src/lib/api/auth';
import { SignInSchema, type SignInInput } from 'apps/pm-ms-ui/src/lib/schemas/auth';

export function SignInForm() {
  const router = useRouter();

  const signInMutation = useMutation({
    mutationFn: async (input: SignInInput) => {
      const response = await authApi.signIn(input);
      return response.data;
    },
    onSuccess: (data) => {
      toast('Sign in successful!', { description: 'Welcome back!', duration: 2000 });
      router.push('/dashboard');
    },
    onError: (error) => {
      console.error('Sign in error:', error);
      const errMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error('Sign in failed. Please check your credentials and try again.', {
        description: errMsg,
      });
    },
  });

  const form = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: SignInInput) {
    await signInMutation.mutateAsync(data);
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold text-center'>Welcome back</CardTitle>
        <CardDescription className='text-center'>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter your email'
                      type='email'
                      autoComplete='email'
                      disabled={signInMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter your password'
                      type='password'
                      autoComplete='current-password'
                      disabled={signInMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' className='w-full' disabled={signInMutation.isPending}>
              {signInMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Sign In
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className='flex flex-col space-y-2'>
        <div className='text-sm text-center text-muted-foreground'>
          <Link href='/forgot-password' className='text-primary hover:underline'>
            Forgot your password?
          </Link>
        </div>
        <div className='text-sm text-center text-muted-foreground'>
          Don&apos;t have an account?{' '}
          <Link href='/signup' className='text-primary hover:underline font-medium'>
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
