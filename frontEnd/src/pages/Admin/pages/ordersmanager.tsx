import { useEffect, useState } from "react";
import apiService from "../../Landing/services/api";

export default function OrdersManager() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const data = await apiService.fetchTableData("orders");
    setOrders(data);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      <table className="w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Receipt</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o: any) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.amount}</td>
              <td>{o.status}</td>
              <td>{o.mpesa_receipt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}