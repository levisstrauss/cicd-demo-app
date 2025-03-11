describe('CICD Demo App', () => {
    it('loads the home page', () => {
      cy.visit('/');
      cy.contains('Welcome to our CI/CD demo app!');
    });
  
    it('checks the health endpoint', () => {
      cy.request('/health').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('status', 'UP');
        expect(response.body).to.have.property('version');
      });
    });
  
    it('performs addition calculation correctly', () => {
      cy.request({
        method: 'POST',
        url: '/calculate',
        body: {
          operation: 'add',
          a: 5,
          b: 3
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('result', 8);
      });
    });
  
    it('performs subtraction calculation correctly', () => {
      cy.request({
        method: 'POST',
        url: '/calculate',
        body: {
          operation: 'subtract',
          a: 10,
          b: 4
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('result', 6);
      });
    });
  
    it('performs multiplication calculation correctly', () => {
      cy.request({
        method: 'POST',
        url: '/calculate',
        body: {
          operation: 'multiply',
          a: 7,
          b: 6
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('result', 42);
      });
    });
  
    it('returns error for invalid operation', () => {
      cy.request({
        method: 'POST',
        url: '/calculate',
        body: {
          operation: 'divide',
          a: 10,
          b: 2
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error');
      });
    });
  });