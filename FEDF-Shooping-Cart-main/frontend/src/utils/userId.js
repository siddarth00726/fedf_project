const GUEST_KEY = 'ssc_guest_id';

export const getGuestId = () => {
  let id = localStorage.getItem(GUEST_KEY);
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(GUEST_KEY, id);
  }
  return id;
};

export const getUserId = (authUser) => (authUser?._id ? authUser._id : getGuestId());
