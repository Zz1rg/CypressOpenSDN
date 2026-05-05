describe('Network Interface Validation', () => {
  it('Verify all required FRR interfaces exist', () => {
    cy.exec('ssh root@100.64.255.9 "ip a"').then((result) => {
      expect(result.stdout).to.include('lo1')       // Loopback for VxLAN
      expect(result.stdout).to.include('br1002')    // Bridge for VxLAN
      expect(result.stdout).to.include('vxlan1002') // VxLAN tunnel
    })
  })

  it('Verify IP addresses are correctly assigned', () => {
    cy.exec('ssh root@100.64.255.9 "ip a"').then((result) => {
      expect(result.stdout).to.include('100.127.255.9')
      expect(result.stdout).to.include('100.64.255.9')
      expect(result.stdout).to.include('10.20.7.9')
      expect(result.stdout).to.include('192.168.2.254')
    })
  })

  it('Verify VxLAN tunnel configuration', () => {
    cy.exec('ssh root@100.64.255.9 "ip link show vxlan1002"').then((result) => {
      expect(result.stdout).to.include('vxlan')
      expect(result.stdout).to.include('br1002')
      expect(result.stdout).to.include('mtu 9000')
    })
  })

  it('Verify VRF configuration', () => {
    cy.exec('ssh root@100.64.255.9 "ip vrf show"').then((result) => {
      expect(result.stdout).to.include('vrf_public')
      expect(result.stdout).to.include('1002')
    })
  })

  it('Verify IP forwarding is enabled', () => {
    cy.exec('ssh root@100.64.255.9 "sysctl net.ipv4.ip_forward"').then((result) => {
      expect(result.stdout).to.include('net.ipv4.ip_forward = 1')
    })
  })

  it('Verify MTU settings on all relevant interfaces', () => {
    cy.exec('ssh root@100.64.255.9 "ip link show br1002"').then((result) => {
      expect(result.stdout).to.include('mtu 9000')
    })
    cy.exec('ssh root@100.64.255.9 "ip link show vxlan1002"').then((result) => {
    expect(result.stdout).to.include('mtu 9000')
    })
  })
})



describe('Connectivity Validation', () => {
  it('FRR can ping Control Node from loopback', () => {
    cy.exec('ssh root@100.64.255.9 "ping -c 4 -I 10.20.7.9 10.10.15.50"').then((result) => {
      expect(result.stdout).to.include('4 packets transmitted')
      expect(result.stdout).to.match(/4 received, 0% packet loss/)
    })
  })

  it('FRR can ping Compute Node vhost0 from loopback', () => {
    cy.exec('ssh root@100.64.255.9 "ping -c 4 -I 10.20.7.9 10.10.15.51"').then((result) => {
      expect(result.stdout).to.include('4 packets transmitted')
      expect(result.stdout).to.match(/4 received, 0% packet loss/)
    })
    cy.exec('ssh root@100.64.255.9 "ping -c 4 -I 10.20.7.9 10.10.15.52"').then((result) => {
      expect(result.stdout).to.include('4 packets transmitted')
      expect(result.stdout).to.match(/4 received, 0% packet loss/)
    })
  })

  it('Traceroute from compute nodes to FRR loopback (verifies L3 routing)', () => {
    cy.exec('ssh root@10.10.15.51 "traceroute -n 10.20.7.9"').then((result) => {
      expect(result.stdout).to.match(/10\.20\.16\.254/)
      expect(result.stdout).to.include('10.20.7.9')
    })
    cy.exec('ssh root@10.10.15.52 "traceroute -n 10.20.7.9"').then((result) => {
      expect(result.stdout).to.match(/10\.20\.16\.254/)
      expect(result.stdout).to.include('10.20.7.9')
    })
  })

  it('Verify routing table on compute nodes includes FRR loopback route', () => {
    cy.exec('ssh root@10.10.15.51 "ip r"').then((result) => {
      expect(result.stdout).to.include('10.20.7.0/24')
      expect(result.stdout).to.include('via 10.20.16.254')
      expect(result.stdout).to.include('dev vhost0')
    })
    cy.exec('ssh root@10.10.15.52 "ip r"').then((result) => {
      expect(result.stdout).to.include('10.20.7.0/24')
      expect(result.stdout).to.include('via 10.20.16.254')
      expect(result.stdout).to.include('dev vhost0')
    })
  })
})



describe('FRR Service Validation', () => {
  it('FRR service is running', () => {
    cy.exec('ssh root@100.64.255.9 "systemctl status frr"').then((result) => {
      expect(result.stdout).to.include('active (running)')
    })
  })

  it('BGP daemon is enabled and running', () => {
    cy.exec('ssh root@100.64.255.9 "cat /etc/frr/daemons | grep bgpd"').then((result) => {
      expect(result.stdout).to.include('bgpd=yes')
    })
  })

  it('Can access vtysh', () => {
    cy.exec('ssh root@100.64.255.9 "vtysh -c \'show version\'"').then((result) => {
      expect(result.stdout).to.include('FRRouting')
    })
  })

  it('VRF public configuration is correct', () => {
    cy.exec('ssh root@100.64.255.9 "vtysh -c \'show running-config\'"').then((result) => {
      expect(result.stdout).to.include('vrf vrf_public')
      expect(result.stdout).to.include('ip route 10.20.16.0/24 br1002')
      expect(result.stdout).to.include('vni 1002')
    })
  })
})



describe('BGP Configuration Validation', () => {
  it('BGP neighbor is configured correctly', () => {
    cy.exec('ssh root@100.64.255.9 "vtysh -c \'show bgp neighbors 10.10.15.50\'"').then((result) => {
      expect(result.stdout).to.include('BGP neighbor is 10.10.15.50')
      expect(result.stdout).to.include('remote AS 64512')
      expect(result.stdout).to.include('Update source is 10.20.7.9')
    })
  })

  it('BGP neighbor status is "Established" or "Up"', () => {
    cy.exec('ssh root@100.64.255.9 "vtysh -c \'show bgp summary\'"').then((result) => {
      const line = result.stdout.split('\n').find(l => l.includes('10.10.15.50'))
      const uptime = line.match(/(\d+w|\d+d|\d+h|\d+m|\d+s|[\d:]+)/)?.[0]
      expect(uptime).to.not.be.undefined
      expect(uptime).to.not.match(/never|^00:00:00$/)
    })
  })

  it('BGP EVPN address-family is configured', () => {
    cy.exec('ssh root@100.64.255.9 "vtysh -c \'show running-config\'"').then((result) => {
      expect(result.stdout).to.include('address-family l2vpn evpn')
      expect(result.stdout).to.include('neighbor 10.10.15.50 activate')
      expect(result.stdout).to.include('advertise-all-vni')
      expect(result.stdout).to.include('advertise ipv4 unicast')
    })
  })

  it('Route targets are correctly configured in VRF', () => {
    cy.exec('ssh root@100.64.255.9 "vtysh -c \'show running-config\'"').then((result) => {
      expect(result.stdout).to.include('route-target import 64512:110')
      expect(result.stdout).to.include('route-target export 64512:110')
    })
  })

  it('BGP summary shows neighbor and routes', () => {
    cy.exec('ssh root@100.64.255.9 "vtysh -c \'show bgp summary\'"').then((result) => {
        expect(result.stdout).to.include('10.10.15.50')
    })
  })
})



describe('EVPN Route Validation', () => { 
  it('EVPN Type-5 routes are present', () => {
    cy.exec('ssh root@100.64.255.9 "vtysh -c \'show bgp l2vpn evpn route type 5\'"').then((result) => {
      expect(result.stdout).to.include('EVPN type-5 prefix')
      expect(result.stdout).to.match(/\[5\]:\[0\]:\[\d+\]:\[\d+\.\d+\.\d+\.\d+\]/)
    })
  })

  it('Floating IP routes from compute nodes are received', () => {
    cy.exec('ssh root@100.64.255.9 "vtysh -c \'show bgp l2vpn evpn route type 5\'"').then((result) => {
      expect(result.stdout).to.include('10.20.16.51')
      expect(result.stdout).to.include('10.20.16.52')
    })
  })

  it('FRR advertises default route and subnet routes', () => {
    cy.exec('ssh root@100.64.255.9 "vtysh -c \'show bgp l2vpn evpn neighbors 10.10.15.50 advertised-routes\'"').then((result) => {
        expect(result.stdout).to.include('0.0.0.0')
        expect(result.stdout).to.include('100.127.255.0')
        expect(result.stdout).to.include('192.168.2.0')
    })
  })

  it('Route distinguishers are correctly assigned', () => {
    cy.exec('ssh root@100.64.255.9 "vtysh -c \'show bgp l2vpn evpn route type 5\'"').then((result) => {
      expect(result.stdout).to.match(/Route Distinguisher: \d+\.\d+\.\d+\.\d+:\d+/)
    })
  })

  it('Extended communities are present (RT, ET, Rmac)', () => {
    cy.exec('ssh root@100.64.255.9 "vtysh -c \'show bgp l2vpn evpn route type 5\'"').then((result) => {
      expect(result.stdout).to.match(/RT:\d+:\d+/)
      expect(result.stdout).to.match(/ET:\d+/)
      expect(result.stdout).to.match(/Rmac:[a-f0-9:]+/)
    })
  })
})



describe('IP Routing Table Validation', () => {
  it('Connected routes are correct', () => {
    cy.exec('ssh root@100.64.255.9 "vtysh -c \'show ip route connected\'"').then((result) => {
      expect(result.stdout).to.include('10.20.7.9/32')
      expect(result.stdout).to.include('100.64.255.0/24')
    })
  })

  it('Static default route exists in VRF', () => {
    cy.exec('ssh root@100.64.255.9 "vtysh -c \'show ip route vrf vrf_public\'"').then((result) => {
      expect(result.stdout).to.include('0.0.0.0/0')
      expect(result.stdout).to.include('100.127.255.9/32')
    })
  })

  it('Received EVPN routes are in routing table', () => {
    cy.exec('ssh root@100.64.255.9 "vtysh -c \'show ip route vrf vrf_public\'"').then((result) => {
      expect(result.stdout).to.match(/\d+\.\d+\.\d+\.\d+\/32/)
    })
  })
})



describe('VxLAN Data Plane Validation', () => {
  it('VxLAN tunnel interface is UP', () => {
    cy.exec('ssh root@100.64.255.9 "ip link show vxlan1002"').then((result) => {
      expect(result.stdout).to.include('UP')
    })
  })

  it('Bridge has VxLAN as member interface', () => {
    cy.exec('ssh root@100.64.255.9 "bridge link show dev vxlan1002"').then((result) => {
      expect(result.stdout).to.include('vxlan1002')
    })
  })

  // it('VxLAN encapsulated packets are being sent', () => {
  //   cy.exec('ssh root@100.64.255.9 "tcpdump -i ens18 -c 5 -n udp port 4789 2>&1 | head -20"', { timeout: 15000 }).then((result) => {
  //     expect(result.stdout).to.match(/VXLAN|4789/)
  //   })
  // })
})



describe('Integration Test - End to End Connectivity', () => {
  const horizonUrl = 'http://10.10.15.50/'
  const instanceName = 'TEST-VM'

  it('Log ENV Variables', () => {
    cy.log('Username: ' + Cypress.env('name'))
    cy.log('Password: ' + Cypress.env('pass'))
  })

  it('Runs ping, then checks output via console log', () => {
    // Log in horizon
    cy.visit(horizonUrl)
    cy.get('#id_username').type(Cypress.env('name'))
    cy.get('#id_password').type(Cypress.env('pass'))
    cy.get('.btn-primary').click()

    // Select project
    cy.get(':nth-child(1) > .dropdown > .dropdown-toggle').click()
    cy.get(':nth-child(1) > .dropdown-menu > :nth-child(3) > a').click()

    // Navigate to Instances
    cy.get('[href="/project/instances/"]').click()
    cy.get('#instances__row__0bc46746-e11b-458f-aa2d-5a5f801bb170 > .anchor > a').click()

    // Prepare tcpdump on FRR
    cy.exec('ssh root@100.64.255.9 "tcpdump -i vxlan1002 -c 5 -w /tmp/capture.pcap icmp &"', { failOnNonZeroExit: false })
    cy.wait(2000)

    // Run testing command
    cy.get('#instance_details a[href="?tab=instance_details__console"]').click()
    cy.get('iframe#console_embed').invoke('attr', 'src').then((src) => {
      cy.visit(src)
      cy.get('canvas').click()
      cy.get('canvas').type('clear{enter}')
      cy.get('canvas').type('ping -c 4 google.com{enter}')
      cy.wait(5000)
    })

    // Check output
    cy.exec('ssh root@100.64.255.9 "tcpdump -r /tmp/capture.pcap -c 4 2>&1 | grep ICMP"', { failOnNonZeroExit: false }).then(result => {
        expect(result.stdout).to.match(/ICMP echo request|ICMP echo reply/)
    })

    // Clean up
    cy.exec('ssh root@100.64.255.9 "rm -f /tmp/capture.pcap"')
  })
})