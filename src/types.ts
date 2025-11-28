import React from 'react';

export interface LoginFormData {
  emailOrUsername: string;
  password: string;
  rememberMe: boolean;
  captchaInput: string;
}

export interface FormErrors {
  emailOrUsername?: string;
  password?: string;
  general?: string;
  captcha?: string;
}

export type IconProps = React.SVGProps<SVGSVGElement>;

export interface CaptchaProps {
  onCaptchaChange: (token: string) => void;
}



export interface Permission {
  id: number;
  code: string;
  label: string;
  category: string;
}

export interface Role {
  id: number;
 role_name: string;
  description: string;
  is_active: boolean;
  permissions: Permission[];
}
