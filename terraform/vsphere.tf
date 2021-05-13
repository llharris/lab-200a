terraform {
  required_providers {
    vsphere = {
      source = "hashicorp/vsphere"
    }
  }
}

data "vsphere_datacenter" "datacenter" {
  name = "Datacenter"
}

data "vsphere_distributed_virtual_switch" "dvs" {
  name          = "DSwitch"
  datacenter_id = "datacenter-3"
}


provider "vsphere" {
  user                 = var.vsphere_user
  password             = var.vsphere_password
  vsphere_server       = var.vsphere_server
  allow_unverified_ssl = true
}

resource "vsphere_distributed_port_group" "pg" {
  name                            = "terraform-test-pg"
  distributed_virtual_switch_uuid = "data.vsphere_distributed_virtual_switch.dvs.id"
}

output "datacenter_id" {
  value = data.vsphere_datacenter.datacenter.id
}
