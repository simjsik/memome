import { LoginPageWrap } from '../styled/LoginComponents';
import LoginBox from './LoginBox';

export default function Login() {

  return (
    <LoginPageWrap>
      <LoginBox isOpen={true}></LoginBox>
    </LoginPageWrap>
  );
}
