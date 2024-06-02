import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, FlatList, Modal, Alert, TouchableOpacity } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Picker } from '@react-native-picker/picker';

const db = SQLite.openDatabase('inventory.db');

const formatDateInput = (input) => {
  const maxLength = 8;
  const cleanedInput = input.replace(/\D/g, '');
  if (cleanedInput.length > maxLength) {
    return cleanedInput.slice(0, maxLength);
  }
  const day = cleanedInput.slice(0, 2);
  const month = cleanedInput.slice(2, 4);
  const year = cleanedInput.slice(4, 8);
  return `${day}/${month}/${year}`.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
};

const ScheduleScreen = () => {
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [orderDate, setOrderDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [orderValue, setOrderValue] = useState('');
  const [productUsed, setProductUsed] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewMode, setViewMode] = useState('pending');
  const [inventory, setInventory] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductPicker, setShowProductPicker] = useState(false);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, orderDate TEXT, deliveryDate TEXT, orderValue TEXT, productUsed TEXT, delivered INTEGER);'
      );
      fetchOrders();
    });
    fetchInventory();
  }, []);

  const fetchOrders = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM orders;',
        [],
        (_, { rows }) => {
          setOrders(rows['_array']);
        }
      );
    });
  };

  const fetchInventory = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM products WHERE stock > 0;',
        [],
        (_, { rows }) => {
          setInventory(rows['_array']);
        }
      );
    });
  };

  const saveOrder = () => {
    if (!selectedProduct) {
      Alert.alert('Erro', 'Selecione um produto para o pedido.');
      return;
    }

    if (editingOrder) {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE orders SET orderDate = ?, deliveryDate = ?, orderValue = ?, productUsed = ?, delivered = ? WHERE id = ?;',
          [orderDate, deliveryDate, orderValue, productUsed, viewMode === 'delivered' ? 1 : 0, editingOrder.id],
          () => {
            fetchOrders();
            setShowForm(false);
            setEditingOrder(null);
          }
        );
      });
    } else {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO orders (orderDate, deliveryDate, orderValue, productUsed, delivered) VALUES (?, ?, ?, ?, ?);',
          [orderDate, deliveryDate, orderValue, selectedProduct.name, viewMode === 'delivered' ? 1 : 0],
          (_, { insertId }) => {
            fetchOrders();
            setShowForm(false);
            updateProductStock(selectedProduct.id);
          }
        );
      });
    }
  };

  const updateProductStock = (productId) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE products SET stock = stock - 1 WHERE id = ?;',
        [productId],
        () => {
          fetchInventory();
        }
      );
    });
  };

  const editOrder = (order) => {
    setOrderDate(order.orderDate);
    setDeliveryDate(order.deliveryDate);
    setOrderValue(order.orderValue);
    setProductUsed(order.productUsed);
    setSelectedProduct(inventory.find(product => product.name === order.productUsed));
    setEditingOrder(order);
    setShowForm(true);
  };

  const deleteOrder = (id) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM orders WHERE id = ?;',
        [id],
        () => {
          fetchOrders();
        }
      );
    });
  };

  const finalizeOrder = (order) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE orders SET delivered = 1 WHERE id = ?;',
        [order.id],
        () => {
          fetchOrders();
        }
      );
    });
  };

  const filterOrders = () => {
    if (viewMode === 'pending') {
      return orders.filter(order => !order.delivered);
    } else {
      return orders.filter(order => order.delivered);
    }
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    setShowForm(false);
  };

  const openProductPicker = () => {
    setShowProductPicker(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'pending' && styles.activeButton]}
          onPress={() => toggleViewMode('pending')}
        >
          <Text style={styles.viewModeButtonText}>Pedidos Pendentes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'delivered' && styles.activeButton]}
          onPress={() => toggleViewMode('delivered')}
        >
          <Text style={styles.viewModeButtonText}>Pedidos Entregues</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filterOrders()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.orderItem, { backgroundColor: item.delivered ? '#ffffff' : '#ffe6e6' }]}>
            <View style={styles.orderInfo}>
              <Text>Data do Pedido: {item.orderDate}</Text>
              <Text>Data de Entrega: {item.deliveryDate}</Text>
              <Text>Valor do Pedido: {item.orderValue}</Text>
              <Text>Produto Utilizado: {item.productUsed}</Text>
            </View>
            <View style={styles.orderButtons}>
              <TouchableOpacity style={styles.editButton} onPress={() => editOrder(item)}>
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteOrder(item.id)}>
                <Text style={styles.buttonText}>Excluir</Text>
              </TouchableOpacity>
              {!item.delivered && (
                <TouchableOpacity style={styles.finalizeButton} onPress={() => finalizeOrder(item)}>
                  <Text style={styles.buttonText}>Finalizar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
      <TouchableOpacity style={styles.newOrderButton} onPress={() => setShowForm(true)}>
        <Text style={styles.newOrderButtonText}>Novo Pedido</Text>
      </TouchableOpacity>
      <Modal visible={showForm} animationType="slide">
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Inserir Pedido</Text>
          <TextInput
            style={styles.input}
            placeholder="Data do Pedido (DD/MM/YYYY)"
            value={orderDate}
            onChangeText={(text) => setOrderDate(formatDateInput(text))}
          />
          <TextInput
            style={styles.input}
            placeholder="Data de Entrega (DD/MM/YYYY)"
            value={deliveryDate}
            onChangeText={(text) => setDeliveryDate(formatDateInput(text))}
          />
          <TextInput
            style={styles.input}
            placeholder="Valor do Pedido"
            value={orderValue}
            onChangeText={setOrderValue}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.productPickerButton} onPress={openProductPicker}>
            <Text style={styles.productPickerButtonText}>Selecione o Produto</Text>
          </TouchableOpacity>
          <Text>{selectedProduct ? selectedProduct.name : 'Nenhum produto selecionado'}</Text>
          <View style={styles.formButtonsContainer}>
            <TouchableOpacity style={[styles.formButton, styles.saveButton]} onPress={saveOrder}>
              <Text style={styles.formButtonText}>Salvar Pedido</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.formButton, styles.cancelButton]} onPress={() => setShowForm(false)}>
              <Text style={styles.formButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
          <Modal visible={showProductPicker} animationType="slide">
            <View style={styles.productPickerContainer}>
              <FlatList
                data={inventory}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.productItem}>
                    <Text>{item.name} - {item.stock} unidades</Text>
                    <TouchableOpacity
                      style={styles.selectProductButton}
                      onPress={() => { setSelectedProduct(item); setShowProductPicker(false); }}
                    >
                      <Text style={styles.buttonText}>Selecionar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
              <TouchableOpacity style={styles.closeProductPickerButton} onPress={() => setShowProductPicker(false)}>
                <Text style={styles.buttonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </Modal>
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
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  viewModeButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#6c757d',
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: '#007bff',
  },
  viewModeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  orderItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderButtons: {
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
    marginRight: 5,
  },
  finalizeButton: {
    backgroundColor: '#28a745',
    borderRadius: 5,
    padding: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  newOrderButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  newOrderButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  formTitle: {
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
  productPickerButton: {
    backgroundColor: '#6c757d',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  productPickerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
  productPickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  productItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectProductButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 10,
  },
  closeProductPickerButton: {
    backgroundColor: '#dc3545',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 20,
  },
});

export default ScheduleScreen;
