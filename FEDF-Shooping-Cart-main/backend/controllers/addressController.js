import {
  addAddress,
  deleteAddressById,
  getAddressesByUser,
  newId,
  updateAddressById,
} from '../data/store.js';

const validateAddress = (data) => {
  const required = ['fullName', 'mobile', 'street', 'city', 'state', 'pincode'];
  for (const field of required) {
    if (!data[field]?.trim()) return `${field} is required`;
  }
  if (!/^[6-9]\d{9}$/.test(data.mobile)) return 'Invalid mobile number';
  if (!/^\d{6}$/.test(data.pincode)) return 'Invalid pincode';
  return null;
};

export const getAddresses = async (req, res) => {
  try {
    res.json(getAddressesByUser(req.params.userId));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAddress = async (req, res) => {
  try {
    const error = validateAddress(req.body);
    if (error) return res.status(400).json({ message: error });
    const now = new Date().toISOString();
    const address = addAddress({ _id: newId(), ...req.body, createdAt: now, updatedAt: now });
    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const error = validateAddress(req.body);
    if (error) return res.status(400).json({ message: error });
    const address = updateAddressById(req.params.id, req.body);
    if (!address) return res.status(404).json({ message: 'Address not found' });
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const deleted = deleteAddressById(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Address not found' });
    res.json({ message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
