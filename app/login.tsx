import React, { useState } from 'react';
import { Text, View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useAuth } from './AuthContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setIsAuthenticated } = useAuth();

  const handleLogin = () => {
    if (username.toLowerCase() === 'admin') {
      setIsAuthenticated(true);
      Alert.alert('Login Successful', `Welcome, ${username}!`);
    } else {
      Alert.alert('Login Failed', 'Invalid username');
    }
  };

  const handleGuest = () => {
    setIsAuthenticated(true);
    Alert.alert('Guest Login', 'You are continuing as a guest.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <View style={styles.guestButton}>
        <Button title="Continue as Guest" onPress={handleGuest} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    width: '80%',
  },
  guestButton: {
    marginTop: 16,
  },
});