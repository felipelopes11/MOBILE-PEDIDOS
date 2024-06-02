import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Modal, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('inventory.db');

const InventoryScreen = () => {
  const [products, setProducts] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [newProductColor, setNewProductColor] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, stock INTEGER, color TEXT);'
      );
      fetchProducts();
    });
  }, []);

  const fetchProducts = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM products;',
        [],
        (_, { rows }) => {
          setProducts(rows['_array']);
        }
      );
    });
  };

  const saveProduct = () => {
    if (selectedProductId) {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE products SET name = ?, stock = ?, color = ? WHERE id = ?;',
          [newProductName, newProductStock, newProductColor, selectedProductId],
          () => {
            fetchProducts();
            setModalVisible(false);
            setSelectedProductId(null);
          }
        );
      });
    } else {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO products (name, stock, color) VALUES (?, ?, ?);',
          [newProductName, newProductStock, newProductColor],
          () => {
            fetchProducts();
            setModalVisible(false);
          }
        );
      });
    }
  };

  const updateProductStock = (productId, increase = false) => {
    const productToUpdate = products.find(product => product.id === productId);
    if (productToUpdate) {
      const newStock = increase ? productToUpdate.stock + 1 : productToUpdate.stock - 1;
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE products SET stock = ? WHERE id = ?;',
          [newStock, productId],
          () => {
            fetchProducts();
          }
        );
      });
    }
  };

  const editProduct = (id, name, stock, color) => {
    setNewProductName(name);
    setNewProductStock(stock.toString());
    setNewProductColor(color);
    setSelectedProductId(id);
    setModalVisible(true);
  };

  const deleteProduct = (id) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM products WHERE id = ?;',
        [id],
        () => {
          fetchProducts();
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Produtos</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <View style={[styles.productItem, { backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff' }]}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text>Estoque: {item.stock}</Text>
              <Text>Cor: {item.color}</Text>
            </View>
            <View style={styles.productButtons}>
              <TouchableOpacity style={styles.editButton} onPress={() => editProduct(item.id, item.name, item.stock, item.color)}>
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteProduct(item.id)}>
                <Text style={styles.buttonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <TouchableOpacity style={styles.newProductButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.newProductButtonText}>Novo Produto</Text>
      </TouchableOpacity>
      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Inserir Produto</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome do Produto"
            value={newProductName}
            onChangeText={setNewProductName}
          />
          <TextInput
            style={styles.input}
            placeholder="Estoque"
            value={newProductStock}
            onChangeText={setNewProductStock}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Cor"
            value={newProductColor}
            onChangeText={setNewProductColor}
          />
          <View style={styles.formButtonsContainer}>
            <TouchableOpacity style={[styles.formButton, styles.saveButton]} onPress={saveProduct}>
              <Text style={styles.formButtonText}>Salvar Produto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.formButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
              <Text style={styles.formButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  productItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productInfo: {
    flex: 1,
  },
  productButtons: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 10,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    borderRadius: 5,
    padding: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  newProductButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  newProductButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    width: '100%',
  },
  formButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  formButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  formButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default InventoryScreen;
