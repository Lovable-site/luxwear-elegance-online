
-- Update the user role to admin for the specified email
UPDATE public.profiles 
SET role = 'admin', updated_at = now() 
WHERE email = 'rharikrishnan8726@gmail.com';
