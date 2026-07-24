import { StatusBar } from 'expo-status-bar';
import { View,Text} from "react-native";
import styles from './Styles';


export default function Loginpage (){
return(
<View>
    <Text  style={styles.text}>
        Login page here
    </Text>
     <StatusBar style="auto" />
</View>
);
}

