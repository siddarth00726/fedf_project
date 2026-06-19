const recommendationMap = {
  laptop: ['mouse', 'keyboard', 'headphones'],
  mobile: ['case', 'charger', 'earbuds'],
  phone: ['case', 'charger', 'earbuds'],
  smartphone: ['case', 'charger', 'earbuds'],
};

export const getRecommendationKeywords = (productName, category) => {
  const text = `${productName} ${category}`.toLowerCase();
  for (const [key, keywords] of Object.entries(recommendationMap)) {
    if (text.includes(key)) return keywords;
  }
  return [];
};
