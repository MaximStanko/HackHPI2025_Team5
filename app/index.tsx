import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function QuestionnaireScreen() {
  const questions = [
    { key: 'age', text: 'Enter your Age:', type: 'input', keyboardType: 'numeric' },
    { key: 'gender', text: 'Gender:', type: 'picker', options: ['Male', 'Female', 'Other'] },
    { key: 'duration', text: 'Duration: How long have you had tinnitus?', type: 'input' },
    { key: 'loudness', text: 'Loudness: How loud is your tinnitus?', type: 'picker', options: ['Soft', 'Moderate', 'Loud'] },
    { key: 'perception', text: 'Where do you perceive your tinnitus?', type: 'picker', options: ['left ear', 'right ear', 'both ears, worse in left', 'both ears, worse in right', 'both ears', 'inside the head'] },
    { key: 'pitch', text: 'Please describe the pitch of your tinnitus?', type: 'picker', options: ['very high frequency', 'high frequency', 'medium frequency', 'low frequency'] },
    { key: 'psychological treatment', text: 'Are you currently under treatment for psychiatric problems?', type: 'picker', options: ['Yes', 'No'] },
    { key: 'dizziness', text: 'Do you suffer from dizziness or vertigo?', type: 'picker', options: ['Yes', 'No'] },
  ];

  const [responses, setResponses] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleChange = (key, value) => {
    setResponses({ ...responses, [key]: value });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      console.log(responses);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Questionnaire</Text>
      <Text style={styles.label}>{currentQuestion.text}</Text>
      
      {currentQuestion.type === 'input' ? (
        <TextInput 
          style={styles.input} 
          keyboardType={currentQuestion.keyboardType || 'default'}
          value={responses[currentQuestion.key] || ''} 
          onChangeText={(text) => handleChange(currentQuestion.key, text)}
        />
      ) : (
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
      )}

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>{currentQuestionIndex < questions.length - 1 ? 'Next' : 'Submit'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F7F9FC',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
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
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
});
