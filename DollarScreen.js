import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('inventory.db');

export default function DollarScreen() {
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM orders WHERE delivered = ?;',
        [1], // 1 para pedidos entregues
        (_, { rows }) => {
          const orders = rows._array;
          setDeliveredOrders(orders);
          const total = orders.reduce((total, order) => total + parseFloat(order.orderValue), 0);
          setTotalAmount(total);
        },
        (_, error) => {
          console.error('Error fetching delivered orders: ', error);
        }
      );
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Extrato de Pedidos Entregues</Text>
      <FlatList
        data={deliveredOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.orderItem}>
            <Text style={styles.orderNumber}>Pedido N{item.id}</Text>
            <Text style={styles.orderValue}>R$ {parseFloat(item.orderValue).toFixed(2)}</Text>
          </View>
        )}
      />
      <Text style={styles.totalAmount}>Total: R$ {totalAmount.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  orderNumber: {
    fontWeight: 'bold',
  },
  orderValue: {
    fontSize: 16,
  },
  totalAmount: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
