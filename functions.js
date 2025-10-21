import { supabase } from './supabaseClient.js';

/* 🧾 Helper to pretty-print table data as JSON */
function printJSONTable(title, data) {
  console.log(`\n=== ${title} ===`);
  if (!data || data.length === 0) {
    console.log("No data found.\n");
  } else {
    console.table(data); // shows nice table format in console
    console.log(JSON.stringify(data, null, 2)); // full JSON output
  }
}

/* 💰 Add cash to a team */
export async function addCash(p_amount, p_team_id) {
  const { data, error } = await supabase.rpc('add_cash', { p_amount, p_team_id });
  if (error) return console.error('❌ Error adding cash:', error);
  printJSONTable('💰 Cash Added', data);
  // Update team's total cash after adding
  await updateTeamCash(p_amount, p_team_id);
  return data;
}

/* 🏠 Add properties in bulk */
export async function addPropertiesBulk() {
  const { data, error } = await supabase.rpc('add_properties_bulk');
  if (error) return console.error('❌ Error adding properties:', error);
  printJSONTable('🏠 Properties Added', data);
  return data;
}

/* ✏️ Edit team details */
export async function editTeam(p_cash, p_new_team_id, p_team_id, p_team_name, p_total_cash) {
  const { data, error } = await supabase.rpc('edit_team', {
    p_cash,
    p_new_team_id,
    p_team_id,
    p_team_name,
    p_total_cash
  });
  if (error) return console.error('❌ Error editing team:', error);
  printJSONTable('✏️ Team Edited', data);
  return data;
}

/* 🏡 Get all available (unowned) properties */
export async function getAvailableProperties() {
  try {
    const { data, error } = await supabase.rpc('get_available_properties');
    console.log('Raw properties data:', data); // Debug log
    if (error) {
      console.error('❌ Error fetching available properties:', error);
      return { data: [], error };
    }
    if (!data) {
      console.log('No data returned from properties query');
      return { data: [], error: null };
    }
    printJSONTable('🏡 Available Properties', data);
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { data: [], error: err };
  }
}

/* 🏆 Get leaderboard (sorted by cash) */
export async function getTeamLeaderboard() {
  const { data, error } = await supabase.rpc('get_team_leaderboard');
  if (error) {
    console.error('Error fetching leaderboard:', error);
    return { data: [], error };
  }
  console.table(data);
  return { data, error: null };
}

/* 📊 Get team summary (cash + properties) */
export async function getTeamSummary(p_team_id) {
  try {
    // First get team details
    const { data: teamData, error: teamError } = await supabase.rpc('get_team_summary', { p_team_id });
    
    if (teamError) {
      console.error('❌ Error fetching team summary:', teamError);
      return { data: null, error: teamError };
    }

    // Then get team's properties using a direct query
    const { data: propertyData, error: propertyError } = await supabase
      .from('team_property')
      .select('*, property:property_name(*)')
      .eq('team_id', p_team_id);

    if (propertyError) {
      console.error('❌ Error fetching team properties:', propertyError);
      return { data: null, error: propertyError };
    }

    // Combine the data with correct property mapping
    const teamSummary = {
      ...teamData[0],
      owned_properties: propertyData?.map(prop => ({
        property_name: prop.property_name,
        value: prop.property?.property_value || 0
      })) || []
    };

    console.log('Combined team summary:', teamSummary);
    return { data: teamSummary, error: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { data: null, error: err };
  }
}

/* 💸 Remove cash from a team */
export async function removeCash(amount, team_id_input) {
  const { data, error } = await supabase.rpc('remove_cash', { amount, team_id_input });
  if (error) return console.error('❌ Error removing cash:', error);
  printJSONTable('💸 Cash Removed', data);
  // Update team's total cash after removing
  await updateTeamCash(-amount, team_id_input);
  return data;
}

/* 🏚️ Remove a property from a team */
export async function removePropertyFromTeam(property_name_input, team_id_input) {
  const { data, error } = await supabase.rpc('remove_property_from_team', {
    property_name_input,
    team_id_input
  });
  if (error) return console.error('❌ Error removing property:', error);
  printJSONTable('🏚️ Property Removed', data);
  return data;
}

/* ❌ Remove an entire team */
export async function removeTeam(p_team_id) {
  const { data, error } = await supabase.rpc('remove_team', { p_team_id });
  if (error) return console.error('❌ Error removing team:', error);
  printJSONTable('❌ Team Removed', data);
  return data;
}

/* 🔁 Update team total cash (cash + property value) */
export async function updateTeamCash(p_amount, p_team_id) {
  try {
    const { data, error } = await supabase.rpc('update_total', { 
      p_team_id: p_team_id 
    });

    if (error) {
      console.error('❌ Error updating team total:', error);
      throw error;
    }

    console.log(`Updated total for team ${p_team_id}`);
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error updating team total:', err);
    return { data: null, error: err };
  }
}

/* 🔄 Reset all tables */
export async function resetAllTables() {
  const { data, error } = await supabase.rpc('reset_all_tables');
  if (error) {
    console.error('❌ Error resetting tables:', error);
    return { data: null, error };
  }
  printJSONTable('🔄 Tables Reset', data);
  return { data, error: null };
}
