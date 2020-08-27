/*
 * Copyright (c) 2020 Talent Beyond Boundaries. All rights reserved.
 */

package org.tbbtalent.server.model.sf;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Represents a Salesforce Contact corresponding to a TBB candidate
 *
 * @author John Cameron
 */
@Getter
@Setter
@ToString
public class Contact {
    static final String urlRoot = "https://talentbeyondboundaries.lightning.force.com/lightning/r/Contact/";
    static final String urlSuffix = "/view";
    
    private Attributes attributes; 
    
    public String Name;
    
    public String Id;
    
    public Long TBBid__c; 
    
    public String getUrl() {
        String url = null;
        if (Id != null) {
            url = urlRoot + Id + urlSuffix;
        }
        return url; 
    }
    
    public static class Attributes {
        public String type;
        public String url;
    }
}
