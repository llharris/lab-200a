terraform {
  required_providers {
    vsphere = {
      source = "hashicorp/vsphere"
    }
  }
}

provider "vsphere" {
  user                 = var.vsphere_user
  password             = var.vsphere_password
  vsphere_server       = var.vsphere_server
  allow_unverified_ssl = true
}

resource "vsphere_datacenter" "prod_datacenter" {
  name = "myDC"
}



resource "vsphere_distributed_port_group" "pg" {
  name = "test-portgroup"
  distributed_virtual_switch_
