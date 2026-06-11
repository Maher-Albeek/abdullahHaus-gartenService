describe('admin gallery upload', () => {
  afterEach(() => {
    cy.get('.admin-gallery-thumbnail[src^="/gallery/about-"]')
      .invoke('attr', 'src')
      .then((imageUrl) => {
        if (imageUrl) cy.request('DELETE', `/api/gallery?path=${encodeURIComponent(imageUrl)}`)
      })
  })

  it('converts, uploads, and displays an image', () => {
    cy.visit('/admin')
    cy.contains('.admin-section-nav button', 'Galerie').click()
    cy.get('.admin-gallery-upload input[type="file"]').selectFile('public/about.jpg', {
      force: true,
    })

    cy.contains('.admin-toast', 'Bild als AVIF gespeichert', { timeout: 30000 }).should('be.visible')
    cy.get('.admin-gallery-thumbnail[src^="/gallery/about-"]').should('be.visible')
  })
})
