import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#F7F9FC',
    },
    input: {
        width: '100%',
        padding: 12,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        fontSize: 16,
    },
    button: {
        width: '100%',
        backgroundColor: '#3498db',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});