import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../redux/context.js';

function PrivateRoute({ children }) {
  const { store } = useAppContext();
  const isLoginFromStore = store.user.isLogin;
  const navigation = useNavigation();

  if (!isLoginFromStore) {
    return  navigation.navigate('LoginScreen');
  }

  return children;
}

export default PrivateRoute;
