import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={require('../assets/profile.png')}
          style={styles.profileImage}
        />
        <Text style={styles.name}>Fernanda Coelho Lopes</Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>CPF:</Text>
            <Text style={styles.text}>184.918.907-26</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>E-mail:</Text>
            <Text style={styles.text}>fernandacoelhocl@gmail.com</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Idade:</Text>
            <Text style={styles.text}>19 anos</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Cidade:</Text>
            <Text style={styles.text}>Rio de Janeiro</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoContainer: {
    width: '100%',
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

export default ProfileScreen;
