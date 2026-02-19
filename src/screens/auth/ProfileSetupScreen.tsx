import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image } from 'react-native';
import { useAuth } from '../../auth/AuthContext';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileSetupScreen() {
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const { signIn } = useAuth();
    const route = useRoute<any>();
    const { token } = route.params;

    const handleCompleteSetup = async () => {
        // Save profile data logic here
        await signIn(token);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Image
                source={require('../../../assets/images/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
            />
            <Text style={styles.title}>Complete Profile</Text>
            <TextInput
                style={styles.input}
                placeholder="Age"
                keyboardType="number-pad"
                value={age}
                onChangeText={setAge}
            />
            <TextInput
                style={styles.input}
                placeholder="Gender"
                value={gender}
                onChangeText={setGender}
            />
            <Button title="Complete Setup" onPress={handleCompleteSetup} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        alignItems: 'center',
    },
    logoImage: { width: 120, height: 80, marginBottom: 20 },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
});
