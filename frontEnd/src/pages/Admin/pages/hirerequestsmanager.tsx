import { useEffect, useState } from "react";
import apiService from "../../Landing/services/api";

export default function HireRequestsManager() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await apiService.fetchTableData("hire_requests");
      setRequests(data);
    } catch (error) {
      console.error("Failed to load hire requests", error);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await apiService.updateRecord("hire_requests", id, { status });
      loadRequests();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Hire Requests</h1>

      <table className="w-full border">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Phone</th>
            <th>Item</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {requests.map((r: any) => (
            <tr key={r.id}>
              <td>{r.customer_name}</td>
              <td>{r.phone_number}</td>
              <td>{r.item_name}</td>
              <td>{r.start_date}</td>
              <td>{r.end_date}</td>
              <td>{r.status}</td>

              <td>
                <button onClick={() => updateStatus(r.id, "approved")}>
                  Approve
                </button>

                <button onClick={() => updateStatus(r.id, "rejected")}>
                  Reject
                </button>

                <button onClick={() => updateStatus(r.id, "returned")}>
                  Returned
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}