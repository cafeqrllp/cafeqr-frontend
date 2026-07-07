import api from '../../utils/api';

export const fetchConfigurations = () => 
  api.get('/api/v1/configurations');

export const fetchCustomers = () => 
  api.get('/api/v1/credit/customers');

export const createCustomer = (payload) => 
  api.post('/api/v1/credit/customers', payload);

export const updateCustomer = (id, payload) => 
  api.put(`/api/v1/credit/customers/${id}`, payload);

export const suspendCustomer = (id) => 
  api.post(`/api/v1/credit/customers/${id}/suspend`);

export const reactivateCustomer = (id) => 
  api.post(`/api/v1/credit/customers/${id}/reactivate`);

export const fetchCustomerOrders = (id) => 
  api.get(`/api/v1/credit/customers/${id}/orders`);

export const fetchCustomerPayments = (id) => 
  api.get(`/api/v1/credit/customers/${id}/payments`);

export const recordPayment = (id, payload) => 
  api.post(`/api/v1/credit/customers/${id}/payments`, payload);
