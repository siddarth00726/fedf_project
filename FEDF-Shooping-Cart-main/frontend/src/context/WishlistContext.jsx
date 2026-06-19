import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { getUserId } from '../utils/userId';
import { addWishlistApi, getWishlistApi, removeWishlistApi } from '../services/api';

const WishlistContext = createContext();
const WISHLIST_KEY = 'ssc_wishlist';

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeProfile, setActiveProfile] = useState(() => {
    return localStorage.getItem('ssc_wishlist_active_profile') || 'Default';
  });
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('ssc_wishlist_profiles');
    return saved ? JSON.parse(saved) : ['Default', 'Dad', 'Mom', 'Kid'];
  });
  const [wishlist, setWishlist] = useState([]);

  const baseUid = getUserId(user);
  const uid = () => {
    return activeProfile === 'Default' ? baseUid : `${baseUid}_${activeProfile}`;
  };

  const getLocalStorageKey = () => {
    return `ssc_wishlist_${baseUid}_${activeProfile}`;
  };

  useEffect(() => {
    if (!baseUid) return;
    const stored = localStorage.getItem(getLocalStorageKey());
    if (stored) {
      setWishlist(JSON.parse(stored));
    } else {
      setWishlist([]);
    }
    syncFromServer();
  }, [baseUid, activeProfile]);

  useEffect(() => {
    if (!baseUid) return;
    localStorage.setItem(getLocalStorageKey(), JSON.stringify(wishlist));
  }, [wishlist, baseUid, activeProfile]);

  useEffect(() => {
    localStorage.setItem('ssc_wishlist_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('ssc_wishlist_active_profile', activeProfile);
  }, [activeProfile]);

  const syncFromServer = async () => {
    try {
      const { data } = await getWishlistApi(uid());
      if (data.products) setWishlist(data.products);
    } catch {
      /* use localStorage fallback */
    }
  };

  const addToWishlist = async (product) => {
    if (wishlist.some((p) => p._id === product._id)) {
      toast.error(`Already in ${activeProfile}'s wishlist`);
      return;
    }
    setWishlist((prev) => [...prev, product]);
    toast.success(`Added to ${activeProfile}'s wishlist`);
    try {
      await addWishlistApi({ userId: uid(), productId: product._id });
    } catch {
      /* local persistence ok */
    }
  };

  const removeFromWishlist = async (id) => {
    setWishlist((prev) => prev.filter((p) => p._id !== id));
    toast.success(`Removed from ${activeProfile}'s wishlist`);
    try {
      await removeWishlistApi({ userId: uid(), productId: id });
    } catch {
      /* local persistence ok */
    }
  };

  const createProfile = (name) => {
    const cleanName = name.trim();
    if (!cleanName) return toast.error('Name cannot be empty');
    if (profiles.some((p) => p.toLowerCase() === cleanName.toLowerCase())) {
      return toast.error('Profile already exists');
    }
    setProfiles((prev) => [...prev, cleanName]);
    setActiveProfile(cleanName);
    toast.success(`Created wishlist profile for ${cleanName}`);
  };

  const selectProfile = (name) => {
    setActiveProfile(name);
  };

  const deleteProfile = (name) => {
    if (name === 'Default') {
      return toast.error('Cannot delete the Default profile');
    }
    setProfiles((prev) => prev.filter((p) => p !== name));
    localStorage.removeItem(`ssc_wishlist_${baseUid}_${name}`);
    if (activeProfile === name) {
      setActiveProfile('Default');
    }
    toast.success(`Deleted wishlist profile for ${name}`);
  };

  const isInWishlist = (id) => wishlist.some((p) => p._id === id);

  const isInProfileWishlist = (productId, profileName) => {
    if (!baseUid) return false;
    if (profileName === activeProfile) {
      return wishlist.some((p) => p._id === productId);
    }
    const key = `ssc_wishlist_${baseUid}_${profileName}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const list = JSON.parse(stored);
        return list.some((p) => p._id === productId);
      } catch {
        return false;
      }
    }
    return false;
  };

  const toggleProfileWishlist = async (product, profileName) => {
    if (!baseUid) return;
    const key = `ssc_wishlist_${baseUid}_${profileName}`;
    const pUid = profileName === 'Default' ? baseUid : `${baseUid}_${profileName}`;
    
    let currentList = [];
    if (profileName === activeProfile) {
      currentList = wishlist;
    } else {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          currentList = JSON.parse(stored);
        } catch {
          currentList = [];
        }
      }
    }
    
    const exists = currentList.some((p) => p._id === product._id);
    let newList;
    if (exists) {
      newList = currentList.filter((p) => p._id !== product._id);
      toast.success(`Removed from ${profileName}'s wishlist`);
      try {
        await removeWishlistApi({ userId: pUid, productId: product._id });
      } catch {}
    } else {
      newList = [...currentList, product];
      toast.success(`Added to ${profileName}'s wishlist`);
      try {
        await addWishlistApi({ userId: pUid, productId: product._id });
      } catch {}
    }
    
    localStorage.setItem(key, JSON.stringify(newList));
    if (profileName === activeProfile) {
      setWishlist(newList);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        isInProfileWishlist,
        toggleProfileWishlist,
        activeProfile,
        selectProfile,
        profiles,
        createProfile,
        deleteProfile,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
