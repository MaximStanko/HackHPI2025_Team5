import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Colors } from './theme.js';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function QuestionnaireScreen() {
  // supabase
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // questionnaire
  const questions = [
    { key: 'age', text: 'Enter your Age:', type: 'input', keyboardType: 'numeric' },
    { key: 'gender', text: 'Gender:', type: 'picker', options: ['Male', 'Female', 'Other'] },
    { key: 'duration', text: 'Duration: How long have you had tinnitus?', type: 'input' },
    { key: 'loudness', text: 'Loudness: How loud is your tinnitus?', type: 'picker', options: ['Soft', 'Moderate', 'Loud'] },
    { key: 'perception', text: 'Where do you perceive your tinnitus?', type: 'picker', options: ['left ear', 'right ear', 'both ears, worse in left', 'both ears, worse in right', 'both ears', 'inside the head'] },
    { key: 'pitch', text: 'Please describe the pitch of your tinnitus?', type: 'picker', options: ['very high frequency', 'high frequency', 'medium frequency', 'low frequency'] },
    { key: 'psychological treatment', text: 'Are you currently under treatment for psychiatric problems?', type: 'picker', options: ['Yes', 'No'] },
    { key: 'dizziness', text: 'Do you suffer from dizziness or vertigo?', type: 'picker', options: ['Yes', 'No'] },
    { key: 'submitted', text: 'Your information has been saved.', type: 'submitted' },
  ];

  const [responses, setResponses] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);

  const handleChange = (key, value) => {
    setResponses({ ...responses, [key]: value });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      
      // Update progress
      const newProgress = ((currentQuestionIndex + 1) / (questions.length - 1)) * 100;
      setProgressPercentage(newProgress);
    }
    if (currentQuestionIndex === questions.length - 2) {
      console.log(responses);
      // Here you would typically save the responses to your database
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      
      // Update progress
      const newProgress = ((currentQuestionIndex - 1) / (questions.length - 1)) * 100;
      setProgressPercentage(newProgress);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  // Load dark mode setting once when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      const storedDarkMode = await AsyncStorage.getItem('darkMode');
      if (storedDarkMode !== null) {
        setIsDarkMode(JSON.parse(storedDarkMode));
      }
    };
    
    loadSettings();
    
    // Set up a listener for changes to dark mode
    const intervalId = setInterval(loadSettings, 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const themeStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <SafeAreaView style={themeStyles.container}>
      <View style={themeStyles.header}>
        <Text style={themeStyles.title}>Questionnaire</Text>
        <View style={themeStyles.progressBar}>
          <View 
            style={[
              themeStyles.progressFill, 
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>
      </View>
      
      <ScrollView contentContainerStyle={themeStyles.scrollContainer}>
        <View style={themeStyles.questionCard}>
          <View style={themeStyles.questionHeader}>
            <Text style={themeStyles.questionNumber}>
              Question {currentQuestionIndex + 1} of {questions.length - 1}
            </Text>
            {currentQuestion.type !== 'submitted' && (
              <FontAwesome 
                name={getQuestionIcon(currentQuestion.type)} 
                size={20} 
                color={isDarkMode ? '#ccc' : Colors.primary} 
              />
            )}
          </View>
          
          <Text style={themeStyles.questionText}>{currentQuestion.text}</Text>
          
          <View style={themeStyles.inputContainer}>
            {currentQuestion.type === 'input' ? (
              <TextInput
                style={themeStyles.input}
                keyboardType={currentQuestion.keyboardType || 'default'}
                value={responses[currentQuestion.key] || ''}
                onChangeText={(text) => handleChange(currentQuestion.key, text)}
                placeholderTextColor={isDarkMode ? '#999' : '#999'}
              />
            ) : currentQuestion.type === 'picker' ? (
              <View style={themeStyles.pickerContainer}>
                <Picker
                  selectedValue={responses[currentQuestion.key] || ''}
                  style={themeStyles.picker}
                  onValueChange={(itemValue) => handleChange(currentQuestion.key, itemValue)}
                  dropdownIconColor={isDarkMode ? '#fff' : '#333'}
                  mode="dropdown"
                >
                  <Picker.Item 
                    label="Select an option" 
                    value="" 
                    color={isDarkMode ? '#999' : '#999'} 
                  />
                  {currentQuestion.options.map((option) => (
                    <Picker.Item 
                      key={option} 
                      label={option} 
                      value={option} 
                      color={isDarkMode ? '#fff' : '#333'}
                    />
                  ))}
                </Picker>
              </View>
            ) : currentQuestion.type === 'submitted' ? (
              <View style={themeStyles.submittedContainer}>
                <FontAwesome name="check-circle" size={60} color={isDarkMode ? '#4caf50' : Colors.primary} />
                <Text style={themeStyles.submittedText}>
                  Thank you for completing the questionnaire!
                </Text>
              </View>
            ) : null}
          </View>
          
          <View style={themeStyles.buttonContainer}>
            <TouchableOpacity
              style={[
                themeStyles.button,
                currentQuestionIndex === 0 && themeStyles.buttonDisabled
              ]}
              onPress={handlePrev}
              disabled={currentQuestionIndex === 0}
            >
              <Text style={themeStyles.buttonText}>Previous</Text>
            </TouchableOpacity>
            
            {currentQuestion.type !== 'submitted' && (
              <TouchableOpacity
                style={themeStyles.button}
                onPress={handleNext}
              >
                <Text style={themeStyles.buttonText}>
                  {currentQuestionIndex === questions.length - 2 ? 'Submit' : 'Next'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to determine icon for question type
function getQuestionIcon(type) {
  switch (type) {
    case 'input':
      return 'keyboard-o';
    case 'picker':
      return 'list';
    case 'submitted':
      return 'check-circle';
    default:
      return 'question-circle';
  }
}

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e1e4e8',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#333',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
  },
  submittedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  submittedText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2f2e2e',
    backgroundColor: '#1E1E1E',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#2f2e2e',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  questionCard: {
    backgroundColor: '#474747',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 14,
    color: '#ccc',
    fontWeight: '500',
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#2f2e2e',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#2f2e2e',
  },
  input: {
    borderWidth: 1,
    borderColor: '#2f2e2e',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#2f2e2e',
    color: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#fff',
    backgroundColor: '#2f2e2e',
  },
  submittedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  submittedText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  buttonDisabled: {
    backgroundColor: '#1E1E1E',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
