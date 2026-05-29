import {
  mapProductFromApi,
  mapProductToApi,
  searchProducts,
} from '../productService.js'

describe('productService', () => {
  describe('mapProductFromApi', () => {
    it('mappe les champs API libellé/prix/catégorie', () => {
      const mapped = mapProductFromApi({
        id: 'p1',
        libelle: 'Clavier',
        description: 'Meca',
        prix: 99.9,
        categorie: 'Info',
        images: [{ url: '/uploads/a.jpg' }],
      })

      expect(mapped).toEqual({
        id: 'p1',
        label: 'Clavier',
        description: 'Meca',
        price: 99.9,
        category: 'Info',
        images: [{ url: '/uploads/a.jpg' }],
      })
    })
  })

  describe('mapProductToApi', () => {
    it('convertit le payload front vers le format backend', () => {
      expect(
        mapProductToApi({
          label: 'Lampe',
          description: 'LED',
          price: 29.5,
          category: 'Maison',
        })
      ).toEqual({
        libelle: 'Lampe',
        description: 'LED',
        prix: 29.5,
        categorie: 'Maison',
      })
    })
  })

  describe('searchProducts', () => {
    const products = [
      { label: 'Clavier', description: 'RGB', category: 'Info' },
      { label: 'Lampe', description: 'Bureau', category: 'Maison' },
    ]

    it('retourne tous les produits si la recherche est vide', () => {
      expect(searchProducts(products, '')).toHaveLength(2)
    })

    it('filtre par libellé, description ou catégorie', () => {
      expect(searchProducts(products, 'bureau')).toHaveLength(1)
      expect(searchProducts(products, 'info')[0].label).toBe('Clavier')
    })
  })
})
