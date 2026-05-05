import { slowCypressDown } from 'cypress-slow-down'
slowCypressDown(500)

const MOCK = true;

describe('Log ENV Variables', () => {
  it('Logs the environment variables', () => {
    cy.log('Username: ' + Cypress.env('name'))
    cy.log('Password: ' + Cypress.env('pass'))
  })
})

/**
 * @Test Case 1: Create VxLAN VN with new LR
 * 1. Login to the application using valid credentials.
 * 2. Navigate to the Network Configurations section.
 * 3. Fill in the required fields to create a VxLAN VN with a new Logical Router:
 *    - Display Name, Subnet, VNI ID, Route Target ASN and Target, Router External, Is Shared.
 * 4. Click the Save button.
 * 5. Check that the corresponding Ports and Floating IP Pools are created.
 * 6. Verify that the VxLAN VN is created successfully and associated with a new Logical Router and has the correct VNI and Route Target values.
 */
var vnForNewLR = 'Cypress-test-VN-auto'
var vniForNewLR = MOCK ? '6767' :'1002'
var asnForNewLR = '64512'
var targetForNewLR = '110'

describe('VxLAN VN Creation (Create with new LR)', () => {
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
        cy.get('input[name="display_name"]', { timeout: 10000 }).type(`${vnForNewLR}`)

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
        cy.get('input[name="user_created_vni_id"]').type(`${vniForNewLR}`)
        cy.get('#user_created_lr_route_targets').within(() => {
          cy.get('.fa.fa-plus').click().then(() => {
            cy.get('input[name="asn"]').type(`${asnForNewLR}`)
            cy.get('input[name="target"]').type(`${targetForNewLR}`)
          })
        })

        // Advance Fields
        cy.get('h3[aria-controls="advanced"]').click()
        cy.get('input[name="router_external"]').click()
        cy.get('input[name="is_shared"]').click()

        // Save Button
        cy.get('button[id="configure-networkbtn1"]').click()
      })
    })

    // Check for Logical Router creation
    cy.visit('https://10.10.15.50:8143/#p=config_net_routers').then(() => {
      cy.get('.slick-cell.l2').should('contain', `${vnForNewLR}-backend-lr`).parent('.slick-row').find('.slick-cell.l4').should('contain', `${vnForNewLR}`)
      cy.contains('.slick-cell.l2', `${vnForNewLR}-backend-lr`)
      .closest('.slick-row') 
      .find('.fa.fa-cog.icon-only.bigger-110.grid-action-dropdown')
      .click()
      .get('a[data-original-title="Edit"]').click()
      .get('input[name="vxlan_network_identifier"]').should('have.value', `${vniForNewLR}`)
      .get('#s2id_connectedNetwork_dropdown').should('contain', `${vnForNewLR}`)
      .get('h3[aria-controls="route_target_vcfg"]').click()
      .get('input[name="asn"]').should('have.value', `${asnForNewLR}`)
      .get('input[name="target"]').should('have.value', `${targetForNewLR}`)
    })
    // Check for Ports creation
    cy.visit('https://10.10.15.50:8143/#p=config_net_ports').then(() => {
      cy.get('.slick-cell.l4').should('contain', `${vnForNewLR}`)
    })

    // Check for Floating IP Pools creation
    cy.visit('https://10.10.15.50:8143/#p=config_networking_fippool').then(() => {
      cy.get('.slick-cell.l5').should('contain', `${vnForNewLR}`)
    })
  })

  // 🤔⁉️ Kampan allows LR to use the same vni now so this might not be necessary
  // it.skip('Create VxLAN VN with new LR (Already Existing VNI)', () => {
  // // Login
  //   cy.visit('https://10.10.15.50:8143/')
  //   cy.get('input[name="username"]').type(Cypress.env('name'))
  //   cy.get('input[name="password"]').type(Cypress.env('pass'))
  //   cy.get('button[type="submit"]', { timeout: 30000 }).click()

  //   // Navigate to Network Configurations
  //   cy.get('#btn-configure').click()
  //   cy.visit('https://10.10.15.50:8143/#p=config_networking_networks').then(() => {
  //     cy.get('.fa.fa-plus').click().then(() => {
  //       // Subnet Fields
  //       cy.get('h3[aria-controls="subnet_vcfg"]').click()
  //       cy.get('#network_ipam_refs').within(() => {
  //         cy.get('.fa.fa-plus').click()
  //       }).then(() => {
  //         cy.get('input[name="user_created_cidr"]').type('100.64.112.0/24')
  //         cy.get('#s2id_user_created_ipam_fqn_dropdown').click()
  //         cy.get('.select2-result-label').click()
  //       })

  //       // Vxlan Fields
  //       cy.get('h3[aria-controls="vxlanProps"]').click()
  //       cy.get('input[value="create-with-new-lr"]').click()
  //       cy.get('input[name="user_created_vni_id"]').type(`${vniForNewLR}`)
  //       cy.get('#user_created_lr_route_targets').within(() => {
  //         cy.get('.fa.fa-plus').click().then(() => {
  //           cy.get('input[name="asn"]').type(`${asnForNewLR}`)
  //           cy.get('input[name="target"]').type(`${targetForNewLR}`)
  //         })
  //       })

  //       // Advance Fields
  //       cy.get('h3[aria-controls="advanced"]').click()
  //       cy.get('input[name="router_external"]').click()
  //       cy.get('input[name="is_shared"]').click()

  //       // Name Field
  //       cy.get('input[name="display_name"]', { timeout: 30000 }).type(`${vnForNewLR}-2`)

  //       // Save Button
  //       cy.get('#configure-networkbtn1').click()
        
  //       // Expect Alert for existing VNI
  //       cy.get('.alert.alert-error').should('contain', `VNI ID ${vniForNewLR} is already in use.`)
  //     })
  //   })
  // })

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
        cy.get('input[name="user_created_vni_id"]').type(`${vniForNewLR}`)

        // Advance Fields
        cy.get('h3[aria-controls="advanced"]').click()
        cy.get('input[name="router_external"]').click()
        cy.get('input[name="is_shared"]').click()

        // Name Field
        cy.get('input[name="display_name"]', { timeout: 30000 }).type(`${vnForNewLR}`)

        // Save Button
        cy.get('#configure-networkbtn1').click()
        
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
        cy.get('input[name="user_created_vni_id"]').type(`${vniForNewLR}`)
        cy.get('#user_created_lr_route_targets').within(() => {
          cy.get('.fa.fa-plus').click().then(() => {
            cy.get('input[name="asn"]').type(`${asnForNewLR}`)
            cy.get('input[name="target"]').type(`${targetForNewLR}`)
          })
        })

        // Advance Fields
        cy.get('h3[aria-controls="advanced"]').click()
        cy.get('input[name="router_external"]').click()
        cy.get('input[name="is_shared"]').click()

        // Name Field
        cy.get('input[name="display_name"]', { timeout: 30000 }).type(`${vnForNewLR}`)

        // Save Button
        cy.get('#configure-networkbtn1').click()
        
        // Expect Alert for missing Route Target
        cy.get('.alert.alert-error').should('contain', 'LR\'s Route Targets and Subnet are required when VXLAN mode is selected')
      })
    })
  })
})

/**
@TestCase 2: Create VxLAN VN by appending to an existing LR
1. Login to the application using valid credentials.
2. Navigate to the Network Configurations section.
3. Fill in the required fields to create a VxLAN VN by appending to an existing Logical Router:
   - Subnet, Select existing LR with VNI, Router External, Is Shared, Display Name.
4. Click the Save button.
5. Check that the corresponding Ports and Floating IP Pools are created.
6. Verify that the VxLAN VN is created successfully and associated with the selected Logical Router and has the correct VNI and Route Target values.
 */
// var lrForAppend = MOCK ? 'For-append-testing' : 'Cypress-test-VN-auto-backend-lr'
var lrForAppend = 'Cypress-test-VN-auto-backend-lr'
var vniForAppend = MOCK ? '6767' : '1002'
var vnForAppend = 'Cypress-test-VN-append'
var asnForAppend = '64512'
var targetForAppend = '110'

describe('VxLAN VN Creation (Append to Existing LR)', () => {
  it('Create VxLAN VN by appending to an existing LR', () => {
    // Login
    cy.visit('https://10.10.15.50:8143/')
    cy.get('input[name="username"]').type(Cypress.env('name'))
    cy.get('input[name="password"]').type(Cypress.env('pass'))
    cy.get('button[type="submit"]', { timeout: 50000 }).click()

    // Navigate to Network Configurations
    cy.get('#btn-configure').click()
    cy.visit('https://10.10.15.50:8143/#p=config_networking_networks').then(() => {
      cy.get('.fa.fa-plus').click().then(() => {
        // Name Field
        cy.get('input[name="display_name"]', { timeout: 50000 }).type(`${vnForAppend}`)

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
        cy.contains('.select2-result-label', `${lrForAppend} (VNI: ${vniForAppend})`).click();

        // Advance Fields
        cy.get('h3[aria-controls="advanced"]').click()
        cy.get('input[name="router_external"]').click()
        cy.get('input[name="is_shared"]').click()

        // Save Button
        cy.get('button[id="configure-networkbtn1"]').click()
      })
    })

    // Check for Ports creation
    cy.visit('https://10.10.15.50:8143/#p=config_net_ports').then(() => {
      cy.get('.slick-cell.l4').should('contain', `${vnForAppend}`)
    })

    // Check for Floating IP Pools creation
    cy.visit('https://10.10.15.50:8143/#p=config_networking_fippool').then(() => {
      cy.get('.slick-cell.l5').should('contain', `${vnForAppend}`)
    })

    // Check for Logical Router appending
    cy.visit('https://10.10.15.50:8143/#p=config_net_routers').then(() => {
      cy.get('.slick-cell.l2').should('contain', `${lrForAppend}`).parent('.slick-row').find('.slick-cell.l4').should('contain', `${vnForAppend}`)
      cy.contains('.slick-cell.l2', `${lrForAppend}`)
      .closest('.slick-row') 
      .find('.fa.fa-cog.icon-only.bigger-110.grid-action-dropdown')
      .click()
      .get('a[data-original-title="Edit"]').click()
      .get('input[name="vxlan_network_identifier"]').should('have.value', `${vniForAppend}`)
      .get('#s2id_connectedNetwork_dropdown').should('contain', `${vnForAppend}`)
      .get('#s2id_connectedNetwork_dropdown').should('contain', `${vnForNewLR}`)
      .get('h3[aria-controls="route_target_vcfg"]').click()
      .get('input[name="asn"]').should('have.value', `${asnForAppend}`)
      .get('input[name="target"]').should('have.value', `${targetForAppend}`)
    })
  })

  // Choose append option without selecting LR should throw error
  it('Create VxLAN VN by appending to an existing LR (without selecting LR)', () => {
    // Login
    cy.visit('https://10.10.15.50:8143/')
    cy.get('input[name="username"]').type(Cypress.env('name'))
    cy.get('input[name="password"]').type(Cypress.env('pass'))
    cy.get('button[type="submit"]', { timeout: 50000 }).click()

    // Navigate to Network Configurations
    cy.get('#btn-configure').click()
    cy.visit('https://10.10.15.50:8143/#p=config_networking_networks').then(() => {
      cy.get('.fa.fa-plus').click().then(() => {
        // Name Field
        cy.get('input[name="display_name"]', { timeout: 50000 }).type(`${vnForAppend}`)

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

        // Advance Fields
        cy.get('h3[aria-controls="advanced"]').click()
        cy.get('input[name="router_external"]').click()
        cy.get('input[name="is_shared"]').click()

        // Save Button
        cy.get('button[id="configure-networkbtn1"]').click()
        cy.get('.alert.alert-error').should('contain', 'logical_routers_with_vni is required when vxlan_vn_creation_mode is "append-to-existing-lr"')
      })
    })
  })

  // choose append option without subnet should throw error
  it('Create VxLAN VN by appending to an existing LR (without subnet)', () => {
    // Login
    cy.visit('https://10.10.15.50:8143/')
    cy.get('input[name="username"]').type(Cypress.env('name'))
    cy.get('input[name="password"]').type(Cypress.env('pass'))
    cy.get('button[type="submit"]', { timeout: 50000 }).click()
    // Navigate to Network Configurations
    cy.get('#btn-configure').click()
    cy.visit('https://10.10.15.50:8143/#p=config_networking_networks').then(() => {
      cy.get('.fa.fa-plus').click().then(() => {
        // Name Field
        cy.get('input[name="display_name"]', { timeout: 50000 }).type(`${vnForAppend}`)

        // Vxlan Fields
        cy.get('h3[aria-controls="vxlanProps"]').click()
        cy.get('input[value="append-to-existing-lr"]').click()
        cy.get('#s2id_logical_routers_with_vni_dropdown').click()
        cy.contains('.select2-result-label', `${lrForAppend} (VNI: ${vniForAppend})`).click();

        // Advance Fields
        cy.get('h3[aria-controls="advanced"]').click()
        cy.get('input[name="router_external"]').click()
        cy.get('input[name="is_shared"]').click()

        // Save Button
        cy.get('button[id="configure-networkbtn1"]').click()
        cy.get('.alert.alert-error').should('contain', 'LR\'s Route Targets and Subnet are required when VXLAN mode is selected')
      })
    })
  })

})

/** 
@TestCase 3: Create Basic VN, test if our new VxLAN VN creation has any impact on the existing basic VN creation flow
1. Login to the application using valid credentials.
2. Navigate to the Network Configurations section.
3. Fill in the required fields to create a basic VN:
   - Display Name, Subnet.
4. Click the Save button.
5. Check that the corresponding Ports and Floating IP Pools are created.
6. Verify that the basic VN is created successfully and has no VNI or Route Target values.
 */
var vnForBasic = 'Cypress-test-Basic-VN'

describe('Basic VN Creation', () => {
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
        cy.get('input[name="display_name"]', { timeout: 10000 }).type(vnForBasic)

        // Save Button
        cy.get('button[id="configure-networkbtn1"]').click()
      })
    })

    // Check for Ports creation
    cy.visit('https://10.10.15.50:8143/#p=config_net_ports').then(() => {
      cy.get('.slick-cell.l4').should('not.contain', vnForBasic)
    })

    // Check for Logical Router creation
    cy.visit('https://10.10.15.50:8143/#p=config_net_routers').then(() => {
      cy.get('.slick-cell.l2').should('not.contain', `${vnForBasic}-backend-lr`)
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
        // fill in the VNI and Route Target fields
        cy.get('input[value="create-with-new-lr"]').click()
        cy.get('input[name="user_created_vni_id"]').type(`${vniForNewLR}`)
        cy.get('#user_created_lr_route_targets').within(() => {
          cy.get('.fa.fa-plus').click().then(() => {
            cy.get('input[name="asn"]').type(`${asnForNewLR}`)
            cy.get('input[name="target"]').type(`${targetForNewLR}`)
          })
        })
        // also select the append to existing LR option to see if it causes any issue even though we won't select any LR
        cy.get('input[value="append-to-existing-lr"]').click()
        cy.get('#s2id_logical_routers_with_vni_dropdown').click()
        cy.contains('.select2-result-label', `${lrForAppend} (VNI: ${vniForAppend})`).click();
        // then switch back to none to make it a basic VN
        cy.get('input[value="none"]').click()

        // Name Field
        cy.get('input[name="display_name"]', { timeout: 10000 }).type(vnForBasic)

        // Save Button
        cy.get('button[id="configure-networkbtn1"]').click()
      })
    })

    // Check for Ports creation
    cy.visit('https://10.10.15.50:8143/#p=config_net_ports').then(() => {
      cy.get('.slick-cell.l4.r4').should('not.contain', vnForBasic)
    })

    // Check for Logical Router creation
    cy.visit('https://10.10.15.50:8143/#p=config_net_routers').then(() => {
      cy.get('.slick-cell.l2.r2').should('not.contain', `${vnForBasic}-backend-lr`)
    })
  })
})

/**
 * @TestCase 4: Cleanup
 * 1. Login to the application using valid credentials.
 * 2. Navigate to the Network Configurations section.
 * 3. Delete the VxLAN VNs created in Test Case 1 and Test Case 2.
 * 4. Verify that the VxLAN VNs, corresponding Ports, Floating IP Pools and Logical Router (for Test Case 1) are deleted successfully.
 */
describe('Cleanup for All testing', () => {
  it('Cleanup the auto created LR for Create with new LR Test', () => {
    // Login
    cy.visit('https://10.10.15.50:8143/')
    cy.get('input[name="username"]').type(Cypress.env('name'))
    cy.get('input[name="password"]').type(Cypress.env('pass'))
    cy.get('button[type="submit"]', { timeout: 50000 }).click()

    // Navigate to Logical Routers and delete the LR created by the test
    cy.get('#btn-configure').click()
    cy.visit('https://10.10.15.50:8143/#p=config_net_routers').then(() => {
      cy.contains('.slick-cell.l2', `${lrForAppend}`)
      .closest('.slick-row')
      .find('input[type="checkbox"]')
      .check()
      cy.get('.fa.fa-trash').click()
      cy.get('#configure-logical_routerbtn1').click()
    })
  })

  // Cleanup for Create with new LR
  it('Cleanup for Create with new LR Test', () => {
    // Login
    cy.visit('https://10.10.15.50:8143/')
    cy.get('input[name="username"]').type(Cypress.env('name'))
    cy.get('input[name="password"]').type(Cypress.env('pass'))
    cy.get('button[type="submit"]', { timeout: 50000 }).click()

    // Navigate to port page and delete the port created by the test
    // cy.visit('https://10.10.15.50:8143/#p=config_net_ports').then(() => {
    //   cy.get('.slick-cell.l4').should('contain', `${vnForNewLR}`)
    //   cy.contains('.slick-cell.l4', `${vnForNewLR}`)
    //   .closest('.slick-row')
    //   .find('input[type="checkbox"]')
    //   .check()
    //   cy.get('.fa.fa-trash').click()
    //   cy.get('a[data-original-title="Delete"]').click()
    //   cy.get('#configure-Portsbtn1').click()
    // })

    // Navigate to Network Configurations and delete the VN created by the test
    cy.visit('https://10.10.15.50:8143/#p=config_networking_networks').then(() => {
      cy.contains('.slick-cell.l2', `${vnForNewLR}`)
      .closest('.slick-row')
      .find('input[type="checkbox"]')
      .check()
      cy.get('.fa.fa-trash').click()
      cy.get('#configure-networkbtn1').click()
    })
  })

  // Cleanup for Append
  it('Cleanup for Append to Existing LR Test', () => {
    // Login
    cy.visit('https://10.10.15.50:8143/')
    cy.get('input[name="username"]').type(Cypress.env('name'))
    cy.get('input[name="password"]').type(Cypress.env('pass'))
    cy.get('button[type="submit"]', { timeout: 50000 }).click()

    // Navigate to port page and delete the port created by the test
    // cy.visit('https://10.10.15.50:8143/#p=config_net_ports').then(() => {
    //   cy.get('.slick-cell.l4').should('contain', `${vnForAppend}`)
    //   cy.contains('.slick-cell.l4', `${vnForAppend}`)
    //   .closest('.slick-row')
    //   .find('input[type="checkbox"]')
    //   .check()
    //   cy.get('.fa.fa-trash').click()
    //   cy.get('a[data-original-title="Delete"]').click()
    //   cy.get('#configure-Portsbtn1').click()
    // })

    // Navigate to Network Configurations and delete the VN created by the test
    cy.visit('https://10.10.15.50:8143/#p=config_networking_networks').then(() => {
      cy.contains('.slick-cell.l2', `${vnForAppend}`)
      .closest('.slick-row')
      .find('input[type="checkbox"]')
      .check()
      cy.get('.fa.fa-trash').click()
      cy.get('#configure-networkbtn1').click()
    })
  })

  it('Cleanup for Basic VN Test', () => {
    // Login
    cy.visit('https://10.10.15.50:8143/')
    cy.get('input[name="username"]').type(Cypress.env('name'))
    cy.get('input[name="password"]').type(Cypress.env('pass'))
    cy.get('button[type="submit"]', { timeout: 30000 }).click()

    // Navigate to Network Configurations and delete the VN created by the test
    cy.visit('https://10.10.15.50:8143/#p=config_networking_networks').then(() => {
      cy.contains('.slick-cell.l2', vnForBasic)
      .closest('.slick-row')
      .find('input[type="checkbox"]')
      .check()
      cy.get('.fa.fa-trash').click()
      cy.get('#configure-networkbtn1').click()
    })
  })

})