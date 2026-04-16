import { slowCypressDown } from 'cypress-slow-down'
slowCypressDown(500)

describe('Log ENV Variables', () => {
  it('Logs the environment variables', () => {
    cy.log('Username: ' + Cypress.env('name'))
    cy.log('Password: ' + Cypress.env('pass'))
  })
})

/*
Test Case 1: Create VxLAN VN with new LR
1. Login to the application using valid credentials.
2. Navigate to the Network Configurations section.
3. Fill in the required fields to create a VxLAN VN with a new Logical Router:
   - Display Name, Subnet, VNI ID, Route Target ASN and Target, Router External, Is Shared.
4. Click the Save button.
5. Check that the corresponding Ports and Floating IP Pools are created.
6. Verify that the VxLAN VN is created successfully and associated with a new Logical Router and has the correct VNI and Route Target values.
 */
describe.skip('VxLAN VN Creation (Create with new LR)', () => {
  it('Create VxLAN VN with new LR', () => {
    // Login
    cy.visit('https://10.10.15.50:8143/')
    cy.get('input[name="username"]').type(Cypress.env('name'))
    cy.get('input[name="password"]').type(Cypress.env('pass'))
    cy.get('button[type="submit"]', { timeout: 30000 }).click()

    // Navigate to Network Configurations
    cy.get('#btn-configure').click()
    cy.visit('https://10.10.15.50:8143/#p=config_networking_networks').then(() => {
      cy.get('.fa.fa-plus').click().then(() => {
        // Name Field
        cy.get('input[name="display_name"]', { timeout: 10000 }).type('Cypress-test-VN-auto')

        // Subnet Fields
        cy.get('h3[aria-controls="subnet_vcfg"]').click()
        cy.get('#network_ipam_refs').within(() => {
          cy.get('.fa.fa-plus').click()
        }).then(() => {
          cy.get('input[name="user_created_cidr"]').type('100.64.112.0/24')
          cy.get('#s2id_user_created_ipam_fqn_dropdown').click()
          cy.get('.select2-result-label').click()
        })

        // Vxlan Fields
        cy.get('h3[aria-controls="vxlanProps"]').click()
        cy.get('input[value="create-with-new-lr"]').click()
        cy.get('input[name="user_created_vni_id"]').type('1002')
        cy.get('#user_created_lr_route_targets').within(() => {
          cy.get('.fa.fa-plus').click().then(() => {
            cy.get('input[name="asn"]').type('64512')
            cy.get('input[name="target"]').type('110')
          })
        })

        // Advance Fields
        cy.get('h3[aria-controls="advanced"]').click()
        cy.get('input[name="router_external"]').click()
        cy.get('input[name="is_shared"]').click()
        // Advance Fields
        cy.get('h3[aria-controls="advanced"]').click()
        cy.get('input[name="router_external"]').click()
        cy.get('input[name="is_shared"]').click()

        // Save Button
        cy.get('button[id="configure-networkbtn1"]').click()
        // Cancel Button For dev to not overwhelm the system with test data
        // cy.get('button[id="cancelBtn"]').click()
      })
    })

    // Check for Logical Router creation
    cy.visit('https://10.10.15.50:8143/#p=config_net_routers').then(() => {
      cy.get('.slick-cell.l2').should('contain', 'Cypress-test-VN-auto-backend-lr').parent('.slick-row').find('.slick-cell.l4').should('contain', 'Cypress-test-VN-auto')
      cy.contains('.slick-cell.l2', 'Cypress-test-VN-auto-backend-lr')
      .closest('.slick-row') 
      .find('.fa.fa-cog.icon-only.bigger-110.grid-action-dropdown')
      .click()
      .get('a[data-original-title="Edit"]').click()
      .get('input[name="vxlan_network_identifier"]').should('have.value', '1002')
      .get('#s2id_connectedNetwork_dropdown').should('contain', 'Cypress-test-VN-auto')
      .get('h3[aria-controls="route_target_vcfg"]').click()
      .get('input[name="asn"]').should('have.value', '64512')
      .get('input[name="target"]').should('have.value', '110')
    })
    // Check for Ports creation
    cy.visit('https://10.10.15.50:8143/#p=config_net_ports').then(() => {
      cy.get('.slick-cell.l4').should('contain', 'Cypress-test-VN-auto')
    })

    // Check for Floating IP Pools creation
    cy.visit('https://10.10.15.50:8143/#p=config_networking_fippool').then(() => {
      cy.get('.slick-cell.l5').should('contain', 'Cypress-test-VN-auto')
    })
  })

  it('Create VxLAN VN with new LR (Already Existing VNI)', () => {
  // Login
    cy.visit('https://10.10.15.50:8143/')
    cy.get('input[name="username"]').type(Cypress.env('name'))
    cy.get('input[name="password"]').type(Cypress.env('pass'))
    cy.get('button[type="submit"]', { timeout: 30000 }).click()

    // Navigate to Network Configurations
    cy.get('#btn-configure').click()
    cy.visit('https://10.10.15.50:8143/#p=config_networking_networks').then(() => {
      cy.get('.fa.fa-plus').click().then(() => {
        // Subnet Fields
        cy.get('h3[aria-controls="subnet_vcfg"]').click()
        cy.get('#network_ipam_refs').within(() => {
          cy.get('.fa.fa-plus').click()
        }).then(() => {
          cy.get('input[name="user_created_cidr"]').type('100.64.112.0/24')
          cy.get('#s2id_user_created_ipam_fqn_dropdown').click()
          cy.get('.select2-result-label').click()
        })

        // Vxlan Fields
        cy.get('h3[aria-controls="vxlanProps"]').click()
        cy.get('input[value="create-with-new-lr"]').click()
        cy.get('input[name="user_created_vni_id"]').type('1002')
        cy.get('#user_created_lr_route_targets').within(() => {
          cy.get('.fa.fa-plus').click().then(() => {
            cy.get('input[name="asn"]').type('64512')
            cy.get('input[name="target"]').type('110')
          })
        })

        // Advance Fields
        cy.get('h3[aria-controls="advanced"]').click()
        cy.get('input[name="router_external"]').click()
        cy.get('input[name="is_shared"]').click()
        // Advance Fields
        cy.get('h3[aria-controls="advanced"]').click()
        cy.get('input[name="router_external"]').click()
        cy.get('input[name="is_shared"]').click()

        // Name Field
        cy.get('input[name="display_name"]', { timeout: 30000 }).type('Cypress-test-VN-auto-2')

        // Save Button
        cy.get('button[id="configure-networkbtn1"]').click()
        // Save Button
        cy.get('button[id="configure-networkbtn1"]').click()
        
        // Expect Alert for existing VNI
        cy.get('.alert.alert-error').should('contain', 'VNI ID 1002 is already in use.')
      })
    })
  })

  it('Create VxLAN VN with new LR (without Route Target)', () => {
    // Login
    cy.visit('https://10.10.15.50:8143/')
    cy.get('input[name="username"]').type(Cypress.env('name'))
    cy.get('input[name="password"]').type(Cypress.env('pass'))
    cy.get('button[type="submit"]', { timeout: 30000 }).click()

    // Navigate to Network Configurations
    cy.get('#btn-configure').click()
    cy.visit('https://10.10.15.50:8143/#p=config_networking_networks').then(() => {
      cy.get('.fa.fa-plus').click().then(() => {
        // Subnet Fields
        cy.get('h3[aria-controls="subnet_vcfg"]').click()
        cy.get('#network_ipam_refs').within(() => {
          cy.get('.fa.fa-plus').click()
        }).then(() => {
          cy.get('input[name="user_created_cidr"]').type('100.64.112.0/24')
          cy.get('#s2id_user_created_ipam_fqn_dropdown').click()
          cy.get('.select2-result-label').click()
        })

        // Vxlan Fields
        cy.get('h3[aria-controls="vxlanProps"]').click()
        cy.get('input[value="create-with-new-lr"]').click()
        cy.get('input[name="user_created_vni_id"]').type('1002')

        // Advance Fields
        cy.get('h3[aria-controls="advanced"]').click()
        cy.get('input[name="router_external"]').click()
        cy.get('input[name="is_shared"]').click()
        // Advance Fields
        cy.get('h3[aria-controls="advanced"]').click()
        cy.get('input[name="router_external"]').click()
        cy.get('input[name="is_shared"]').click()

        // Name Field
        cy.get('input[name="display_name"]', { timeout: 30000 }).type('Cypress-test-VN-auto')

        // Save Button
        cy.get('button[id="configure-networkbtn1"]').click()
        // Save Button
        cy.get('button[id="configure-networkbtn1"]').click()
        
        // Expect Alert for missing Route Target
        cy.get('.alert.alert-error').should('contain', 'LR\'s Route Targets and Subnet are required when VXLAN mode is selected')
      })
    })
  })

  it('Create VxLAN VN with new LR (without Subnet)', () => {
    // Login
    cy.visit('https://10.10.15.50:8143/')
    cy.get('input[name="username"]').type(Cypress.env('name'))
    cy.get('input[name="password"]').type(Cypress.env('pass'))
    cy.get('button[type="submit"]', { timeout: 30000 }).click()

    // Navigate to Network Configurations
    cy.get('#btn-configure').click()
    cy.visit('https://10.10.15.50:8143/#p=config_networking_networks').then(() => {
      cy.get('.fa.fa-plus').click().then(() => {
        // Vxlan Fields
        cy.get('h3[aria-controls="vxlanProps"]').click()
        cy.get('input[value="create-with-new-lr"]').click()
        cy.get('input[name="user_created_vni_id"]').type('1002')
        cy.get('#user_created_lr_route_targets').within(() => {
          cy.get('.fa.fa-plus').click().then(() => {
            cy.get('input[name="asn"]').type('64512')
            cy.get('input[name="target"]').type('110')
          })
        })

        // Advance Fields
        cy.get('h3[aria-controls="advanced"]').click()
        cy.get('input[name="router_external"]').click()
        cy.get('input[name="is_shared"]').click()
        // Advance Fields
        cy.get('h3[aria-controls="advanced"]').click()
        cy.get('input[name="router_external"]').click()
        cy.get('input[name="is_shared"]').click()

        // Name Field
        cy.get('input[name="display_name"]', { timeout: 30000 }).type('Cypress-test-VN-auto')

        // Save Button
        cy.get('button[id="configure-networkbtn1"]').click()
        // Save Button
        cy.get('button[id="configure-networkbtn1"]').click()
        
        // Expect Alert for missing Route Target
        cy.get('.alert.alert-error').should('contain', 'LR\'s Route Targets and Subnet are required when VXLAN mode is selected')
      })
    })
  })

  // ❌❌❌❌❌❌❌❌❌❌ Paimee is working here
  it.skip('Check external connectivity', () => {
    cy.visit('http://10.10.15.50')
    cy.get('[name="username"]').type(Cypress.env('name'))
    cy.get('[name="password"]').type(Cypress.env('pass'))
    cy.get('#loginBtn span', { timeout: 30000 }).click()

    cy.get('#navbar-collapse ul:nth-child(1) span.fa-caret-down').click()
    cy.get('#navbar-collapse li:nth-child(1) li:nth-child(3) a').click()
    cy.get('#sidebar-accordion-project-compute a[href="/project/instances/"]').click()
    cy.get('#instances tr.even td.anchor a').click()
    cy.get('#instance_details a[href="?tab=instance_details__console"]').click()
  })

  // ❌❌❌❌❌❌❌❌❌❌ Paimee is working here
  it.skip('Delete created VxLAN VN with new LR', () => {
    // Login
    cy.visit('https://10.10.15.50:8143/')
    cy.get('input[name="username"]').type(Cypress.env('name'))
    cy.get('input[name="password"]').type(Cypress.env('pass'))
    cy.get('button[type="submit"]', { timeout: 30000 }).click()

    // Delete automatically created Port
    cy.visit('https://10.10.15.50:8143/#p=config_net_ports').then(() => {
      cy.get('.slick-cell.l4.r4').should('contain', 'Cypress-test-VN-auto')
      cy.get('.slick-cell.l1.r4').click()
      cy.get(':nth-child(5) > .dropdown-toggle > .fa').click()
    })
  })
})

/*
Test Case 2: Create VxLAN VN with existing LR
1. Login to the application using valid credentials.
2. Navigate to the Network Configurations section.
3. Fill in the required fields to create a VxLAN VN by appending to an existing Logical Router:
   - Subnet, Select existing LR with VNI, Router External, Is Shared, Display Name.
4. Click the Save button.
5. Check that the corresponding Ports and Floating IP Pools are created.
6. Verify that the VxLAN VN is created successfully and associated with the selected Logical Router and has the correct VNI and Route Target values.
 */
describe.skip('VxLAN VN Creation (Append to Existing LR)', () => {
  it('Create VxLAN VN with existing LR', () => {
    // Login
    cy.visit('https://10.10.15.50:8143/')
    cy.get('input[name="username"]').type(Cypress.env('name'))
    cy.get('input[name="password"]').type(Cypress.env('pass'))
    cy.get('button[type="submit"]', { timeout: 50000 }).click()

    // Navigate to Network Configurations
    cy.get('#btn-configure').click()
    cy.visit('https://10.10.15.50:8143/#p=config_networking_networks').then(() => {
      cy.get('.fa.fa-plus').click().then(() => {
        // Subnet Fields
        cy.get('h3[aria-controls="subnet_vcfg"]').click()
        cy.get('#network_ipam_refs').within(() => {
          cy.get('.fa.fa-plus').click()
        }).then(() => {
          cy.get('input[name="user_created_cidr"]').type('100.64.114.0/24')
          cy.get('#s2id_user_created_ipam_fqn_dropdown').click()
          cy.get('.select2-result-label').click()
        })

        // Vxlan Fields
        cy.get('h3[aria-controls="vxlanProps"]').click()
        cy.get('input[value="append-to-existing-lr"]').click()
        cy.get('#s2id_logical_routers_with_vni_dropdown').click()
        cy.contains('.select2-result-label', 'Cypress-test-VN-auto-backend-lr (VNI: 1002)').click();

        // Advance Fields
        cy.get('h3[aria-controls="advanced"]').click()
        cy.get('input[name="router_external"]').click()
        cy.get('input[name="is_shared"]').click()

        // Name Field
        cy.get('input[name="display_name"]', { timeout: 50000 }).type('Cypress-test-VN-append')

        // Save Button
        cy.get('button[id="configure-networkbtn1"]').click()
        // Cancel Button For dev to not overwhelm the system with test data
        // cy.get('button[id="cancelBtn"]').click()
      })
    })

    // Check for Ports creation
    cy.visit('https://10.10.15.50:8143/#p=config_net_ports').then(() => {
      cy.get('.slick-cell.l4').should('contain', 'Cypress-test-VN-append')
    })

    // Check for Floating IP Pools creation
    cy.visit('https://10.10.15.50:8143/#p=config_networking_fippool').then(() => {
      cy.get('.slick-cell.l5').should('contain', 'Cypress-test-VN-append')
    })

    // Check for Logical Router appending
    cy.visit('https://10.10.15.50:8143/#p=config_net_routers').then(() => {
      cy.get('.slick-cell.l2').should('contain', 'Cypress-test-VN-auto-backend-lr').parent('.slick-row').find('.slick-cell.l4').should('contain', 'Cypress-test-VN-append')
      cy.contains('.slick-cell.l2', 'Cypress-test-VN-auto-backend-lr')
      .closest('.slick-row') 
      .find('.fa.fa-cog.icon-only.bigger-110.grid-action-dropdown')
      .click()
      .get('a[data-original-title="Edit"]').click()
      .get('input[name="vxlan_network_identifier"]').should('have.value', '1002')
      .get('#s2id_connectedNetwork_dropdown').should('contain', 'Cypress-test-VN-append')
      .get('#s2id_connectedNetwork_dropdown').should('contain', 'Cypress-test-VN-auto')
      .get('h3[aria-controls="route_target_vcfg"]').click()
      .get('input[name="asn"]').should('have.value', '64512')
      .get('input[name="target"]').should('have.value', '110')
    })
  })
})

describe.skip('Basic VN Creation', () => {
  it('Create Basic VN', () => {
    // Login
    cy.visit('https://10.10.15.50:8143/')
    cy.get('input[name="username"]').type(Cypress.env('name'))
    cy.get('input[name="password"]').type(Cypress.env('pass'))
    cy.get('button[type="submit"]', { timeout: 30000 }).click()

    // Navigate to Network Configurations
    cy.get('#btn-configure').click()
    cy.visit('https://10.10.15.50:8143/#p=config_networking_networks').then(() => {
      cy.get('.fa.fa-plus').click().then(() => {
        // Subnet Fields
        cy.get('h3[aria-controls="subnet_vcfg"]').click()
        cy.get('#network_ipam_refs').within(() => {
          cy.get('.fa.fa-plus').click()
        }).then(() => {
          cy.get('input[name="user_created_cidr"]').type('100.64.116.0/24')
          cy.get('#s2id_user_created_ipam_fqn_dropdown').click()
          cy.get('.select2-result-label').click()
        })

        // Vxlan Fields
        cy.get('h3[aria-controls="vxlanProps"]').click()
        cy.get('input[value="none"]').click()

        // Name Field
        cy.get('input[name="display_name"]', { timeout: 10000 }).type('Cypress-test-Basic-VN')

        // Save Button
        cy.get('button[id="configure-networkbtn1"]').click()
      })
    })

    // Check for Ports creation
    cy.visit('https://10.10.15.50:8143/#p=config_net_ports').then(() => {
      cy.get('.slick-cell.l4').should('not.contain', 'Cypress-test-Basic-VN')
    })

    // Check for Logical Router creation
    cy.visit('https://10.10.15.50:8143/#p=config_net_routers').then(() => {
      cy.get('.slick-cell.l2').should('not.contain', 'Cypress-test-Basic-VN-backend-lr')
    })
  })

  it('Create Basic VN (with lingering VNI)', () => {
    // Login
    cy.visit('https://10.10.15.50:8143/')
    cy.get('input[name="username"]').type(Cypress.env('name'))
    cy.get('input[name="password"]').type(Cypress.env('pass'))
    cy.get('button[type="submit"]', { timeout: 30000 }).click()

    // Navigate to Network Configurations
    cy.get('#btn-configure').click()
    cy.visit('https://10.10.15.50:8143/#p=config_networking_networks').then(() => {
      cy.get('.fa.fa-plus').click().then(() => {
        // Subnet Fields
        cy.get('h3[aria-controls="subnet_vcfg"]').click()
        cy.get('#network_ipam_refs').within(() => {
          cy.get('.fa.fa-plus').click()
        }).then(() => {
          cy.get('input[name="user_created_cidr"]').type('100.64.118.0/24')
          cy.get('#s2id_user_created_ipam_fqn_dropdown').click()
          cy.get('.select2-result-label').click()
        })

        // Vxlan Fields
        cy.get('h3[aria-controls="vxlanProps"]').click()
        cy.get('input[value="none"]').click()

        // Name Field
        cy.get('input[name="display_name"]', { timeout: 10000 }).type('Cypress-test-Basic-VN')

        // Save Button
        cy.get('button[id="configure-networkbtn1"]').click()
      })
    })

    // Check for Ports creation
    cy.visit('https://10.10.15.50:8143/#p=config_net_ports').then(() => {
      cy.get('.slick-cell.l4.r4').should('not.contain', 'Cypress-test-Basic-VN')
    })

    // Check for Logical Router creation
    cy.visit('https://10.10.15.50:8143/#p=config_net_routers').then(() => {
      cy.get('.slick-cell.l2.r2').should('not.contain', 'Cypress-test-Basic-VN-backend-lr')
    })
  })
})