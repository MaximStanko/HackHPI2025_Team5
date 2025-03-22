import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase'
import Auth from '../components/Auth'
import Account from '../components/Account'
import { Session } from '@supabase/supabase-js'
import { Colors } from './theme.js';


export default function QuestionnaireScreen() {
  // supabase
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  // questionnaire
  const questions = [
    { key: 'age', text: 'Enter your Age:', type: 'input', keyboardType: 'numeric' },
    { key: 'gender', text: 'Gender:', type: 'picker', options: ['Male', 'Female', 'Kirby', 'Other'] },
    { key: 'duration', text: 'Duration: How long have you had tinnitus?', type: 'input' },
    { key: 'loudness', text: 'Loudness: How loud is your tinnitus?', type: 'picker', options: ['Soft', 'Moderate', 'Loud'] },
    { key: 'perception', text: 'Where do you perceive your tinnitus?', type: 'picker', options: ['left ear', 'right ear', 'both ears, worse in left', 'both ears, worse in right', 'both ears', 'inside the head'] },
    { key: 'pitch', text: 'Please describe the pitch of your tinnitus?', type: 'picker', options: ['very high frequency', 'high frequency', 'medium frequency', 'low frequency'] },
    { key: 'psychological treatment', text: 'Are you currently under treatment for psychiatric problems?', type: 'picker', options: ['Yes', 'No'] },
    { key: 'dizziness', text: 'Do you suffer from dizziness or vertigo?', type: 'picker', options: ['Yes', 'No'] },
    { key: 'submitted', text: 'Your information has been saved.', type: 'submitted'},
  ];

  const [responses, setResponses] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleChange = (key, value) => {
    setResponses({ ...responses, [key]: value });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
    if (currentQuestionIndex == questions.length - 2) {
      console.log(responses);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Questionnaire</Text>
      <Text style={styles.label}>{currentQuestion.text}</Text>
      
      <View style={styles.inputContainer}>
        {currentQuestion.type === 'input' ? (
          <TextInput 
            style={styles.input} 
            keyboardType={currentQuestion.keyboardType || 'default'}
            value={responses[currentQuestion.key] || ''} 
            onChangeText={(text) => handleChange(currentQuestion.key, text)}
          />
        ) : currentQuestion.type === 'picker' ? (
          <Picker
            selectedValue={responses[currentQuestion.key] || ''}
            style={styles.picker}
            onValueChange={(itemValue) => handleChange(currentQuestion.key, itemValue)}
          >
            <Picker.Item label="Select an option" value="" />
            {currentQuestion.options.map((option) => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
        ) : (<></>)}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={currentQuestionIndex == 0 ? styles.buttonDisabled : styles.button} onPress={handlePrev} disabled={currentQuestionIndex == 0}>
          <Text style={styles.buttonText}>{'Previous'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={currentQuestion.key === 'submitted' ? styles.buttonDisabled : styles.button} onPress={handleNext} disabled={currentQuestion.key === 'submitted'}>
          <Text style={styles.buttonText}>{'Next'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 'auto',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    maxHeight: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.primary,
  },
  label: {
    fontSize: 16,
    marginBottom: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingTop: 6,
    paddingBottom: 6,
    paddingRight: 10,
    paddingLeft: 10,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    paddingTop: 6,
    paddingBottom: 6,
    paddingRight: 10,
    paddingLeft: 10,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
});
