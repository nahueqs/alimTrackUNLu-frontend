import React from 'react';
import { Button, Form, Input, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import type { LoginRequest } from '@/services/auth/Auth.ts';
import './LoginForm.css';

interface LoginFormProps {
  onLogin: (credentials: LoginRequest) => Promise<void>;
  loading: boolean;
  onSwitchToRegister: () => void;
  error: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  loading,
  // onSwitchToRegister, // Deshabilitado
  error,
}) => {
  const [form] = Form.useForm();

  const onFinish = async (values: LoginRequest) => {
    try {
      await onLogin(values);
      message.success('¡Bienvenido de nuevo!');
    } catch (err) {
      // Error is handled by the parent component
    }
  };

  const onFinishFailed = (_errorInfo: any) => {
    message.error('Por favor, corrige los errores en el formulario.');
  };

  return (
    <div className={`login-form ${loading ? 'login-form--loading' : ''}`}>
      <h2 className="login-form__title">Iniciar Sesión</h2>

      {error && <div className="login-form__error">{error}</div>}

      <Form
        form={form}
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="on"
        layout="vertical"
        disabled={loading}
      >
        <Form.Item
          label="Correo Electrónico"
          name="email"
          rules={[
            { required: true, message: 'Por favor ingresa tu correo electrónico!' },
            { type: 'email', message: 'El formato del correo electrónico no es válido!' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="email@unlu.edu.ar" />
        </Form.Item>

        <Form.Item
          label="Contraseña"
          name="password"
          rules={[{ required: true, message: 'Por favor ingresa tu contraseña!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Tu contraseña" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Iniciar Sesión
          </Button>
        </Form.Item>
      </Form>

      {/* Registro deshabilitado temporalmente
      <div className="login-form__switch">
        <span>¿No tienes cuenta? </span>
        <Button type="link" onClick={onSwitchToRegister} disabled={loading}>
          Regístrate aquí
        </Button>
      </div>
      */}
    </div>
  );
};
