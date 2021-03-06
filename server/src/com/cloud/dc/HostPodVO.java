/**
 *  Copyright (C) 2010 Cloud.com, Inc.  All rights reserved.
 * 
 * This software is licensed under the GNU General Public License v3 or later.
 * 
 * It is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 */

package com.cloud.dc;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.cloud.org.Grouping;
import com.cloud.utils.NumbersUtil;
import com.cloud.utils.db.GenericDao;

@Entity
@Table(name = "host_pod_ref")
public class HostPodVO implements Pod {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	long id;

	@Column(name = "name")
	private String name = null;

	@Column(name = "data_center_id")
	private long dataCenterId;
	
	@Column(name = "gateway")
	private String gateway;

	@Column(name = "cidr_address")
	private String cidrAddress;

	@Column(name = "cidr_size")
	private int cidrSize;

	@Column(name = "description")
	private String description;
	
    @Column(name="allocation_state")
    @Enumerated(value=EnumType.STRING)
    AllocationState allocationState;

	@Column(name = "external_dhcp")
	private Boolean externalDhcp;
	
    @Column(name=GenericDao.REMOVED_COLUMN)
    private Date removed;


	public HostPodVO(String name, long dcId, String gateway, String cidrAddress, int cidrSize, String description) {
		this.name = name;
		this.dataCenterId = dcId;
		this.gateway = gateway;
		this.cidrAddress = cidrAddress;
		this.cidrSize = cidrSize;
		this.description = description;
		this.allocationState = Grouping.AllocationState.Enabled;
		this.externalDhcp = false;
	}

	/*
	 * public HostPodVO(String name, long dcId) { this(null, name, dcId); }
	 */
	protected HostPodVO() {
	}

	@Override
    public long getId() {
		return id;
	}

	public long getDataCenterId() {
		return dataCenterId;
	}

	public void setDataCenterId(long dataCenterId) {
		this.dataCenterId = dataCenterId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Override
    public String getCidrAddress() {
		return cidrAddress;
	}

	public void setCidrAddress(String cidrAddress) {
		this.cidrAddress = cidrAddress;
	}

	@Override
    public int getCidrSize() {
		return cidrSize;
	}

	public void setCidrSize(int cidrSize) {
		this.cidrSize = cidrSize;
	}
	
	@Override
    public String getGateway() {
		return gateway;
	}
	
	public void setGateway(String gateway) {
		this.gateway = gateway;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}
	
    public AllocationState getAllocationState() {
    	return allocationState;
    }
    
    public void setAllocationState(AllocationState allocationState) {
		this.allocationState = allocationState;
    }
	
	// Use for comparisons only.
	public HostPodVO(Long id) {
	    this.id = id;
	}
	
	@Override
    public int hashCode() {
	    return  NumbersUtil.hash(id);
	}
	
	public boolean getExternalDhcp() {
		return externalDhcp;
	}
	
	public void setExternalDhcp(boolean use) {
		externalDhcp = use;
	}
	
	@Override
    public boolean equals(Object obj) {
	    if (obj instanceof HostPodVO) {
	        return id == ((HostPodVO)obj).id;
	    } else {
	        return false;
	    }
	}
	
    public Date getRemoved() {
        return removed;
    }
}
