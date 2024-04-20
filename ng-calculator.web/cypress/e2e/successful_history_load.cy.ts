import { environment } from '../../src/environments/environment';

describe('template spec', () => {
  it('passes', () => {
    //load site
    cy.visit('/')
    //test api
    cy.request(environment.apiBaseUrl)
    //check that help text is displayed for successful load
    cy.get('.history-help-text').then(($el) => {
      let visible = Cypress.dom.isVisible($el)
      expect(visible).to.be.true
    })
  })
})
