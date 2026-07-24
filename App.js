import { StatusBar } from 'expo-status-bar';
import { Loginpage } from './components/Loginpage';
import styles from './components/Styles';


export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Oh my god Cring!</Text>
      <Loginpage></Loginpage>
      <StatusBar style="auto" />
    </View>
  );
}


