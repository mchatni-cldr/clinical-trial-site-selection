"""
Synthetic Data Generator for Clinical Trial Site Selection Demo
Generates 4 CSV files with embedded narrative:
- Boston Site-22: Prestigious but flatlines (PI sabbatical)
- Omaha Site-47: Hidden gem with 95% enrollment rate
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

# Set random seed for reproducibility
np.random.seed(42)

class ClinicalTrialDataGenerator:
    def __init__(self, output_dir='data'):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
        # US Cities with realistic distribution
        self.cities = [
            ('Boston', 'MA', 'large', 'academic'),
            ('New York', 'NY', 'large', 'academic'),
            ('Philadelphia', 'PA', 'large', 'academic'),
            ('Chicago', 'IL', 'large', 'academic'),
            ('Los Angeles', 'CA', 'large', 'academic'),
            ('Omaha', 'NE', 'medium', 'community'),  # Our hidden gem
            ('Nashville', 'TN', 'medium', 'community'),
            ('Phoenix', 'AZ', 'large', 'community'),
            ('Dallas', 'TX', 'large', 'community'),
            ('Houston', 'TX', 'large', 'academic'),
            ('Miami', 'FL', 'large', 'community'),
            ('Atlanta', 'GA', 'large', 'academic'),
            ('Seattle', 'WA', 'large', 'academic'),
            ('Denver', 'CO', 'medium', 'community'),
            ('Portland', 'OR', 'medium', 'community'),
            ('San Diego', 'CA', 'large', 'academic'),
            ('San Francisco', 'CA', 'large', 'academic'),
            ('Minneapolis', 'MN', 'medium', 'academic'),
            ('Detroit', 'MI', 'medium', 'academic'),
            ('Cleveland', 'OH', 'medium', 'academic'),
        ]
        
        # Realistic PI names
        self.first_names = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 
                           'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara',
                           'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah',
                           'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa']
        
        self.last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia',
                          'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez',
                          'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson',
                          'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Clark']
        
        self.therapeutic_areas = ['Oncology', 'Cardiology', 'Neurology', 'Immunology', 
                                 'Endocrinology', 'Respiratory', 'Gastroenterology']
        
    def generate_sites_and_investigators(self, n_sites=500):
        """Generate sites_and_investigators.csv"""
        sites = []
        
        for i in range(n_sites):
            site_id = f"Site-{i+1:03d}"
            
            # Special handling for our narrative sites
            if i == 21:  # Site-022 - Boston trap
                city, state = 'Boston', 'MA'
                site_type = 'academic'
                site_name = 'Boston Medical Center'
            elif i == 46:  # Site-047 - Omaha gem
                city, state = 'Omaha', 'NE'
                site_type = 'community'
                site_name = 'Nebraska Regional Cancer Center'
            else:
                city, state, _, site_type = self.cities[i % len(self.cities)]
                site_name = f"{city} {'Medical Center' if site_type == 'academic' else 'Regional Hospital'}"
            
            # Generate PI credentials
            pi_name = f"Dr. {np.random.choice(self.first_names)} {np.random.choice(self.last_names)}"
            pi_experience = np.random.randint(5, 25)
            
            # Therapeutic areas (most sites do multiple)
            n_areas = np.random.choice([1, 2, 3], p=[0.3, 0.5, 0.2])
            areas = np.random.choice(self.therapeutic_areas, n_areas, replace=False)
            therapeutic_areas = '; '.join(areas)
            
            sites.append({
                'site_id': site_id,
                'site_name': site_name,
                'city': city,
                'state': state,
                'site_type': site_type,
                'therapeutic_areas': therapeutic_areas,
                'pi_name': pi_name,
                'pi_experience_years': pi_experience,
                'beds': np.random.randint(50, 500) if site_type == 'academic' else np.random.randint(20, 150)
            })
        
        df = pd.DataFrame(sites)
        filepath = os.path.join(self.output_dir, 'sites_and_investigators.csv')
        df.to_csv(filepath, index=False)
        print(f"✓ Generated {filepath} ({len(df)} sites)")
        return df
    
    def generate_historical_performance(self, sites_df):
        """Generate historical_performance.csv with embedded narrative"""
        performance = []
        
        for idx, row in sites_df.iterrows():
            site_id = row['site_id']
            city = row['city']
            site_type = row['site_type']
            
            # Base performance by site type
            if site_type == 'academic':
                base_enrollment = 0.78  # Academic sites: good but not great
                base_screen_fail = 0.25
                base_dropout = 0.12
                base_quality = 0.82
            else:
                base_enrollment = 0.72  # Community sites: slightly lower
                base_screen_fail = 0.22
                base_dropout = 0.10
                base_quality = 0.85
            
            # Special handling for narrative sites
            if site_id == 'Site-022':  # Boston trap
                enrollment_rate = 0.78  # Looks good on paper
                screen_fail_rate = 0.28  # But high screen fails (picky PI)
                dropout_rate = 0.15
                data_quality = 0.75
                trials_completed = 12  # Experienced
                avg_days_to_first_patient = 45
                protocol_deviations = 8  # Red flag
                
            elif site_id == 'Site-047':  # Omaha gem
                enrollment_rate = 0.95  # Outstanding!
                screen_fail_rate = 0.12  # Low screen fails
                dropout_rate = 0.05     # Low dropout
                data_quality = 0.98     # Excellent quality
                trials_completed = 8    # Decent experience
                avg_days_to_first_patient = 22  # Fast!
                protocol_deviations = 1  # Nearly perfect
                
            else:
                # Add noise around base rates
                enrollment_rate = np.clip(base_enrollment + np.random.normal(0, 0.08), 0.4, 0.98)
                screen_fail_rate = np.clip(base_screen_fail + np.random.normal(0, 0.05), 0.05, 0.45)
                dropout_rate = np.clip(base_dropout + np.random.normal(0, 0.04), 0.02, 0.25)
                data_quality = np.clip(base_quality + np.random.normal(0, 0.06), 0.6, 1.0)
                trials_completed = np.random.randint(2, 15)
                avg_days_to_first_patient = np.random.randint(20, 90)
                protocol_deviations = np.random.randint(0, 12)
            
            performance.append({
                'site_id': site_id,
                'trials_completed': trials_completed,
                'avg_enrollment_rate': round(enrollment_rate, 3),
                'avg_screen_fail_rate': round(screen_fail_rate, 3),
                'avg_dropout_rate': round(dropout_rate, 3),
                'data_quality_score': round(data_quality, 3),
                'avg_days_to_first_patient': avg_days_to_first_patient,
                'protocol_deviations_per_trial': round(protocol_deviations / max(trials_completed, 1), 2)
            })
        
        df = pd.DataFrame(performance)
        filepath = os.path.join(self.output_dir, 'historical_performance.csv')
        df.to_csv(filepath, index=False)
        print(f"✓ Generated {filepath} ({len(df)} records)")
        return df
    
    def generate_patient_density(self, sites_df):
        """Generate patient_density.csv with geographic patterns"""
        density = []
        
        for idx, row in sites_df.iterrows():
            site_id = row['site_id']
            city = row['city']
            state = row['state']
            
            # Base patient density by city size
            city_data = next((c for c in self.cities if c[0] == city), None)
            if city_data:
                city_size = city_data[2]
                if city_size == 'large':
                    base_patients = 600
                    base_competing = 6
                else:
                    base_patients = 300
                    base_competing = 2
            else:
                base_patients = 400
                base_competing = 3
            
            # Special handling for narrative sites
            if site_id == 'Site-022':  # Boston trap
                eligible_patients = 720  # High density
                competing_trials = 8     # But lots of competition!
                median_income = 85000
                travel_burden_score = 0.65  # Urban traffic
                
            elif site_id == 'Site-047':  # Omaha gem
                eligible_patients = 380  # Moderate density
                competing_trials = 0     # ZERO competition! Key differentiator
                median_income = 62000
                travel_burden_score = 0.92  # Easy access
                
            else:
                eligible_patients = int(base_patients + np.random.normal(0, 150))
                competing_trials = max(0, int(base_competing + np.random.normal(0, 2)))
                median_income = int(np.random.normal(65000, 20000))
                travel_burden_score = np.clip(np.random.normal(0.75, 0.15), 0.3, 1.0)
            
            # Calculate accessibility index (higher is better)
            accessibility_index = (
                (eligible_patients / 1000) * 0.4 +
                (1 - competing_trials / 10) * 0.4 +
                travel_burden_score * 0.2
            )
            
            density.append({
                'site_id': site_id,
                'eligible_patients_30mi': max(50, eligible_patients),
                'competing_trials_same_indication': max(0, competing_trials),
                'median_household_income': median_income,
                'travel_burden_score': round(travel_burden_score, 2),
                'accessibility_index': round(accessibility_index, 3)
            })
        
        df = pd.DataFrame(density)
        filepath = os.path.join(self.output_dir, 'patient_density.csv')
        df.to_csv(filepath, index=False)
        print(f"✓ Generated {filepath} ({len(df)} records)")
        return df
    
    def generate_weekly_enrollment_feed(self):
        """Generate weekly_enrollment_feed.csv for top 10 selected sites"""
        # Top 10 sites selected (hardcoded for narrative)
        selected_sites = [
            'Site-047',  # Omaha gem
            'Site-156',
            'Site-089',
            'Site-234',
            'Site-022',  # Boston trap
            'Site-311',
            'Site-178',
            'Site-412',
            'Site-267',
            'Site-145'
        ]
        
        enrollment = []
        start_date = datetime(2024, 7, 1)  # Trial started 3 months ago
        
        for week in range(13):  # 13 weeks of data
            week_date = start_date + timedelta(weeks=week)
            
            for site_id in selected_sites:
                if site_id == 'Site-022':  # Boston trap narrative
                    if week < 4:
                        # First 3 weeks: looks good
                        screened = np.random.randint(3, 6)
                        enrolled = np.random.randint(2, 4)
                    else:
                        # Week 4+: PI goes on sabbatical, enrollment flatlines
                        screened = np.random.randint(0, 2)
                        enrolled = 0
                    screen_fail_reasons = 'Eligibility criteria not met; Withdrew consent'
                    
                elif site_id == 'Site-047':  # Omaha gem
                    # Steady, reliable performance (slight variance)
                    screened = np.random.randint(5, 8)
                    enrolled = np.random.randint(4, 7)
                    screen_fail_reasons = 'Eligibility criteria not met'
                    
                else:
                    # Normal variance for other sites
                    screened = np.random.randint(2, 7)
                    enrolled = np.random.randint(1, 5)
                    screen_fail_reasons = 'Eligibility criteria not met; Lab abnormalities; Withdrew consent'
                
                enrollment.append({
                    'week': week + 1,
                    'week_ending_date': week_date.strftime('%Y-%m-%d'),
                    'site_id': site_id,
                    'patients_screened': screened,
                    'patients_enrolled': enrolled,
                    'screen_fail_reasons': screen_fail_reasons
                })
        
        df = pd.DataFrame(enrollment)
        filepath = os.path.join(self.output_dir, 'weekly_enrollment_feed.csv')
        df.to_csv(filepath, index=False)
        print(f"✓ Generated {filepath} ({len(df)} records)")
        return df
    
    def generate_all(self):
        """Generate all CSV files"""
        print("\n🔧 Generating synthetic clinical trial data...\n")
        
        sites_df = self.generate_sites_and_investigators()
        performance_df = self.generate_historical_performance(sites_df)
        density_df = self.generate_patient_density(sites_df)
        enrollment_df = self.generate_weekly_enrollment_feed()
        
        print("\n✅ All CSV files generated successfully!")
        print(f"   Location: {os.path.abspath(self.output_dir)}/")
        print("\n📊 Data Summary:")
        print(f"   - Sites: {len(sites_df)}")
        print(f"   - Boston Site-022 (Trap): High prestige, but will flatline")
        print(f"   - Omaha Site-047 (Gem): 95% enrollment, 0 competing trials")
        print(f"   - Weekly enrollment: 13 weeks × 10 sites = {len(enrollment_df)} records")
        
        return sites_df, performance_df, density_df, enrollment_df


if __name__ == '__main__':
    generator = ClinicalTrialDataGenerator()
    generator.generate_all()