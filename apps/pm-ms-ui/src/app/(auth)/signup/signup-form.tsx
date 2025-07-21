'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { AxiosError } from 'axios';

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
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authApi } from 'apps/pm-ms-ui/src/lib/api/auth';
import { SignUpSchema, type SignUpInput } from 'apps/pm-ms-ui/src/lib/schemas/auth';

export function SignUpForm() {
  const router = useRouter();

  const signUpMutation = useMutation({
    mutationFn: authApi.signUp,
    mutationKey: ['signUp'],
    throwOnError: false,
    onSuccess: () => {
      router.push('/signin');
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status === 409) {
          form.setError('email', {
            type: 'manual',
            message: 'User with this email already exists',
          });
          return;
        }
      }
      const errMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(errMsg, {
        description: 'Please try again or contact support if the issue persists.',
        duration: 2000,
      });
    },
  });

  const form = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: SignUpInput) {
    await signUpMutation.mutateAsync(data);
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold text-center'>Create an account</CardTitle>
        <CardDescription className='text-center'>
          Enter your information to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter your first name'
                        type='text'
                        autoComplete='firstName'
                        disabled={signUpMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter your last name'
                        type='text'
                        autoComplete='lastName'
                        disabled={signUpMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                      disabled={signUpMutation.isPending}
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
                      placeholder='Create a password'
                      type={'password'}
                      autoComplete='new-password'
                      disabled={signUpMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Confirm your password'
                      type='password'
                      autoComplete='new-password'
                      disabled={signUpMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' className='w-full' disabled={signUpMutation.isPending}>
              {signUpMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Create Account
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className='text-sm text-center text-muted-foreground w-full'>
          Already have an account?{' '}
          <Link href='/signin' className='text-primary hover:underline font-medium'>
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
